#!/usr/bin/python
# -*- coding: utf-8 -*-
import signal
import json
import time
import sys
import traceback
import threading
import re
import socket
import os
import random
print("Python v" + sys.version)

import logger
from SimpleWebSocketServer import WebSocket, SimpleWebSocketServer
import SimpleHTTPServer, SocketServer
from transitions import Machine

class Object(object): pass;

""" SETTINGS """
dealer_lag = 0.25
ws_port = 8000
http_port = 8001
http_root = "www/"
server_version = 0.1
server_hostname = socket.gethostname()

""" CARD RELATED CONSTANTS """
# SUIT index ranges from 1 to 5.
SUIT_str  = [None,"Spades","Clubs","Diamonds","Hearts","No Trumps"]
SUIT_disp = [None,"♠","♣","♦","♥",""] # not displayable for python output.
SUIT_leftBower = [None,2,1,4,3,None] # left bower's suit
# RANK index ranges from 3 to 15.
RANK_str  = [None,None,None,"3","4","5","6","7","8","9","10","Jack","Queen","King","Ace","Joker"]
RANK_disp = [None,None,None,"3","4","5","6","7","8","9","10","J","Q","K","A","Jok"]
NO_CARDS = False
FULL_DECK = True

class Client(object):
  def __init__(self, conn):
    self.connection = conn
    self.username = None
    self.latency = 0.0000
    self.seat = None
    self.hand = Deck(NO_CARDS)
  def toJSONobj(self):
    JSONobj = Object()
    if self.connection:
      JSONobj.connection = Object()
      JSONobj.connection.host = self.connection.address[0]
      JSONobj.connection.instance = self.connection.address[1]
    if self.username:
      JSONobj.username = self.username
    if self.latency != 0.0000:
      JSONobj.latency = self.latency
    if self.seat:
      JSONobj.seat = self.seat
    return JSONobj
  def logID(self):
    if self.username:
      return self.username
    else:
      return str(self.connection.address[0]) + '-' + str(self.connection.address[1])
class WS_Handler(WebSocket):
  def sendData(self, message_type, message_data = None):
    toSend = Object()
    toSend.header = message_type
    if message_data != None:
      if isinstance(message_data, Object):
        toSend.data = json.dumps(message_data, default=lambda o: o.__dict__, sort_keys=True)
      else:
        toSend.data = message_data
    string = unicode(json.dumps(toSend.__dict__))
    string = cleanJSONstring(string)
    # print "outgoing", string
    self.sendMessage(string)
  def getClient(self):
    for client in allClients():
      if client.connection == self:
        return client
    return False
  def getUsername(self):
    for client in allClients():
      if client.connection == self:
        return client.username
    return False
  def setUsername(self, username):
    for client in allClients():
      if client.connection == self:
        client.username = username
  def handleMessage(self):
    # print "incoming", self.data
    try:
        message = json.loads(self.data)
        if message['header'] == "usernameRequest":
          usernameRequest(self, message['data'])
        elif message['header'] == "seatRequest":
          seatRequest(self, message['data'])
        elif message['header'] == "pong":
          pong(self, message['data'])
        elif message['header'] == "chat":
          sendChatOut(self, message['data'])
        else:
          print "Unknown Message:", self.data
    except: # catch *all* exceptions
        e = traceback.format_exc()
        f = sys.exc_info()
        print "Error: " + str(e)
  def handleConnected(self):
    try:
        newUser = Client(self)
        clients.append(newUser)
        logger.sockEntry(str(self.address[0]) + '-' + str(self.address[1]) + ': New socket connection.')
        sendSeatsAvailability(self)
        self.sendData("loginRequest")
        self.sendData("serverVersion",server_version)
        self.sendData("ping", logger.datetime_str())
    except: # catch *all* exceptions
        e = traceback.format_exc()
        f = sys.exc_info()
        print "Error: " + str(e)
  def handleClose(self):
    logger.sockEntry(str(self.address[0]) + '-' + str(self.address[1]) + ': Socket connection disconnected.')
    sendLeftNotification(self)
    if self.getClient().seat != None:
      thisGame.playerLeft()
    clients.remove(self.getClient())
    for client in allClients():
      sendSeatsAvailability(client.connection)
    sendUserList()
class HTTP_Handler(SimpleHTTPServer.SimpleHTTPRequestHandler):
  def log_message(self, format, *args):
    # override logging output
    if "index.html" in str(format%args):
      logger.httpEntry(str(self.address_string()) + " - " + str(format%args));
  def translate_path(self, path):
    path = http_root + path
    return path
class Card(object):
  def __init__(self, suit=1, rank=3):
    self.suit = suit
    self.rank = rank
  def __str__(self):
    if self.suit == 5:
      return "The Joker"
    else:
      return RANK_str[self.rank] + " of " + SUIT_str[self.suit]
  def __cmp__(self, other):
    #print "self",str(self.suit),str(self.rank)
    #print "other",str(other.suit),str(other.rank)
    if self.rank == 15: return 1 # 1st is the Joker
    if other.rank == 15: return -1  # 2nd is the Joker
    if (self.suit == trumps and self.rank == 11): return 1 # 1st is the right bower
    if (other.suit == trumps and other.rank == 11): return -1 # 2nd is the right bower
    if (self.suit == SUIT_leftBower[trumps] and self.rank == 11): return 1 # 1st is the left bower
    if (other.suit == SUIT_leftBower[trumps] and other.rank == 11): return -1 # 2nd is the left bower
    if (self.suit == trumps and other.suit != trumps): return 1 # 1st only is on suit
    if (other.suit == trumps and self.suit != trumps): return -1 # 2nd only is on suit
    if cmp(self.suit, other.suit) == 0: # same suit -> highest wins
      return cmp(self.rank, other.rank)
    else:
      return 0
  def jsonStr(self):
    return str(self.toJSONobj().__dict__)
  def toJSONobj(self):
    JSONobj = Object()
    JSONobj.suit = self.suit
    JSONobj.rank = self.rank
    return JSONobj
class Deck(object):
  def __init__(self, fill=True):
    self.cards=[]
    if fill:
      for suit in range(1,3): # Create the black cards
        for rank in range(4, 15):
          new_card = Card(suit, rank)
          self.cards.append(new_card)
      for suit in range(3,5): # Create the red cards
        for rank in range(5, 15):
          new_card = Card(suit, rank)
          self.cards.append(new_card)
      new_card = Card(5, 15) # create the Joker
      self.cards.append(new_card)
  def __str__(self):
    string = ""
    for card in self.cards:
      string = string + str(card) + "\n"
    return string[:-1]
  def addCard(self, card):
    self.cards.append(card)
  def removeCard(self, card):
    self.cards.remove(card)
  def removeCardIndex(self, index):
    del self.cards[index]
  def popCard(self, i=-1):
    return self.cards.pop(i)
  def moveCards(self, otherDeck, num):
    for i in range(num):
      otherDeck.addCard(self.popCard())
  def sort(self):
    self.cards.sort()
  def shuffle(self):
    random.shuffle(self.cards)
  def getIndex(self, findcard):
    for index,card in enumerate(self.cards):
      if card == findcard:
        return index
    return -1
  def winningIndex(self):
    tempCards = self.cards
    tempCards.sort()
    if tempCards[-1] > tempCards[-2]:
      return self.getIndex(tempCards[-1])
    return -1
  def jsonStr(self):
    str(self.toJSONobj().cards.__dict__)
  def toJSONobj(self):
    JSONobj = Object()
    JSONobj.cards = []
    for card in self.cards:
      JSONobj.cards.append(card.toJSONobj())
    return JSONobj
  def countCards(self):
    return len(self.cards)
  def sortHand():
    None
# This is the game state machine.
# It will be updated as each element of the game is implemented.
# Not currently integrated with the WS logic.
# Uses the transitions library
# https://github.com/tyarkoni/transitions
# pip install transitions
class GameMachine(Machine):

  # DEFINITIONS
  # hand: one game (10 tricks), at the end of which the score is awarded
  # bids: the potential contract that the player is agreeing to achieve (eg: 6 Hearts)
  # kitty: three cards, the contract winner receives before the hand starts
  # trick: a round of the game, where each player places a card on the table

  dealerButton = 0 # player index who is the current 'dealer'. Initially random.
  dealerFocus = 0 # this is the player the dealer is waiting on or is dealing to.
  game_deck = Deck(FULL_DECK)
  kitty = Deck(NO_CARDS)

  states = [
    'accepting players',
    'accepting bids',
    'winners lead',
    'finishing trick',
    'assessing the trick',
    'scoring the hand'
  ]
  transitions = [
    {'trigger':'deal', 'source':'accepting players', 'dest':'accepting bids', 'conditions':'four_players_seated', 'before': 'deal_cards', 'after': 'ask_for_bid'},
    {'trigger':'award_kitty', 'source':'accepting bids', 'dest':'winners lead', 'conditions':'winning_bid', 'before': 'award_kitty', 'after': 'ask_for_discard'},
  ]

  ## Conditions ##
  def four_players_seated(self):
    if seat2client(1) and seat2client(2) and seat2client(3) and seat2client(4):
      logger.gameEntry("Four players are sitting.")
      return True
    else:
      logger.gameEntry("Waiting for more players.")
      return False
  def winning_bid(self): return self.transit
  def kittyThrown(self): return self.transit
  def scoreOver500(self): return self.transit

  ## Utilities ##
  def incrementDealerFocus(self):
    self.dealerFocus = ((self.dealerFocus) % 4) + 1

  ## Doers ##
  def ask_for_discard(self):
      None
  def stop_playing(self):
    logger.gameEntry("A player left :(")
  def deal_cards(self):
    # this is threaded as there are blocking delays involved.
    # The state machine will progress on completion of the thread.
    def deal_thread():
      # if a player drops during this, it hurts.

      logger.gameEntry("Emptying the player's hands and kitty.")
      for seat in xrange(1, 5):
        seat2client(seat).hand = Deck(NO_CARDS)
      self.kitty = Deck(NO_CARDS)

      logger.gameEntry("Initialising and shuffling the game deck.")
      self.game_deck = Deck(FULL_DECK)
      sendCardUpdate()
      self.game_deck.shuffle()

      # if the first deal, randomise the dealer
      if self.dealerButton == 0:
        self.dealerButton = random.randint(1, 4)

      # dealer focus is next player for deal
      self.dealerFocus = self.dealerButton
      self.incrementDealerFocus()
      sendDealerNotification("Dealing for " + seat2client(self.dealerButton).username + " to " + seat2client(self.dealerFocus).username + ".")

      sendCardUpdate()
      for cards_to_deal in [3, 4, 3]:
        for i in range(4):
          for j in range(cards_to_deal):
            self.game_deck.moveCards(seat2client(self.dealerFocus).hand, 1)
            seat2client(self.dealerFocus).hand.sort()
            sendCardUpdate()
            logger.gameEntry("Just dealt to " + seat2client(self.dealerFocus).username + ".")
            time.sleep(0.25)

          self.incrementDealerFocus()
        self.game_deck.moveCards(self.kitty, 1)
        sendCardUpdate()
        time.sleep(0.25)

      self.getBids()
    t = threading.Thread(target=deal_thread, args=[])
    t.start()
  def ask_for_bid(self):
    sendDealerNotification(seat2client(self.dealerFocus).username +"'s bid.")

    # Need to rearrange the table depending on player position
    # Need to check the order of dealing


  def __init__(self):
    dealerButton = random.randint(1, 4)
    self.transit = False
    Machine.__init__(self, states=self.states, transitions=self.transitions, initial=self.states[0])
  def __str__(self): return "GameMachine state is '" + self.state + "'."

def allClients():
  clientlist = []
  for client in list(clients):
    clientlist.append(client)
  return clientlist
def allUsers():
  userlist = []
  for client in list(clients):
    if client.username:
      userlist.append(client)
  return list(userlist)
def seatedUsers():
  userlist = []
  for client in list(clients):
    if client.seat != None:
      userlist.append(client)
  return list(userlist)
def seat2client(seat):
  for client in seatedUsers():
    if client.seat == seat:
      return client
  return None
def username2client(username):
  for client in list(clients):
    if client.username == username:
      return client
  return None
def usernameRequest(conn, username):
  if username2client(username):
    conn.sendData("usernameExists")
    logger.sockEntry(conn.getClient().logID() + ': Username request denied - exists (' + username + ').')
  else:
    logger.sockEntry(conn.getClient().logID() + ': Username accepted ('+username +').')
    conn.setUsername(username)
    conn.sendData("loginAccepted", username)
    sendClientData(conn)
    sendUserList()
    sendSeatsAvailability(conn)
    sendLoginNotification(conn)
    sendCardUpdate()
def seatRequest(conn, seat):
  if seat2client(seat):
    conn.sendData("seatTaken")
    logger.sockEntry(conn.getClient().username + ': Seat '+ str(seat) +' request denied - already taken.')
    sendSeatsAvailability(conn)
  else:
    conn.getClient().seat = seat
    conn.sendData("seatAccepted", seat)
    sendClientData(conn)
    logger.sockEntry(conn.getClient().username + ' sat in seat '+ str(seat) +'.')
    for client in allClients():
      sendSeatsAvailability(client.connection)
    thisGame.deal()
def pong(conn, pingStampStr):
  conn.getClient().latency = logger.secondsSinceDateTimeStr(pingStampStr)
  sendClientData(conn)
def sendChatOut(conn, msg):
  chatObject = Object()
  chatObject.fromUser = conn.getUsername()
  chatObject.message = msg
  if conn.getUsername():
    # logger.sockEntry(conn.getUsername() + ' said: ' + chatObject.message)
    for client in allClients():
      client.connection.sendData("chatMessage",chatObject)
def sendLoginNotification(conn):
  notificationObject = Object()
  notificationObject.str = conn.getUsername() + " logged in."
  for client in allClients():
    if client.connection != conn:
      client.connection.sendData("notification",notificationObject)
def sendLeftNotification(conn):
  notificationObject = Object()
  notificationObject.str = conn.getUsername() + " left."
  for client in allClients():
    if client.connection != conn:
      client.connection.sendData("notification",notificationObject)
def sendSeatsAvailability(conn):
  seats = [None,None,None,None,None]
  for client in seatedUsers():
    seats[client.seat] = client.username
  conn.sendData("seatsAvailability", seats)
def sendCardUpdate():
  previousSeat = [None,4,1,2,3]
  nextSeat = [None,2,3,4,1]
  partnerSeat = [None,3,4,1,2]
  for seat in range(1,5):
    cardUpdateObject = Object()
    if len(seatedUsers()) < 4:
      cardUpdateObject.myHand = Object()
      cardUpdateObject.myHand.hand = []
      cardUpdateObject.previousHand = 0
      cardUpdateObject.nextHand = 0
      cardUpdateObject.partnerHand = 0
      cardUpdateObject.kitty = 0
      cardUpdateObject.deck = 0
    else:
      cardUpdateObject.myHand = seat2client(seat).hand.toJSONobj()
      cardUpdateObject.previousHand = seat2client(previousSeat[seat]).hand.countCards()
      cardUpdateObject.nextHand = seat2client(nextSeat[seat]).hand.countCards()
      cardUpdateObject.partnerHand = seat2client(partnerSeat[seat]).hand.countCards()
      cardUpdateObject.kitty = thisGame.kitty.countCards()
      cardUpdateObject.deck = thisGame.game_deck.countCards()
      #cardUpdateObject.previousHandPeak = seat2client(previousSeat[seat]).hand.toJSONobj()
      #cardUpdateObject.nextHandPeak = seat2client(nextSeat[seat]).hand.toJSONobj()
      #cardUpdateObject.partnerHandPeak = seat2client(partnerSeat[seat]).hand.toJSONobj()
      #cardUpdateObject.kittyPeak = thisGame.kitty.toJSONobj()
      #cardUpdateObject.deckPeak = thisGame.game_deck.toJSONobj()
      seat2client(seat).connection.sendData("cardUpdate",cardUpdateObject)
def sendClientData(conn):
  userdata = conn.getClient().toJSONobj()
  conn.sendData("clientData", userdata)
def cleanJSONstring(string):
  """ These are regular expressions to correct the format for send client objects """
  string = re.sub(r'"{', r"{", string);
  string = re.sub(r'}"', r"}", string);
  string = re.sub(r' \\"', r' "', string);
  string = re.sub(r'{\\"', r'{"', string);
  string = re.sub(r'\\"}', r'"}', string);
  string = re.sub(r'\\":', r'":', string);
  string = re.sub(r'\\",', r'",', string);
  #string = re.sub(r"': u'", r"': '", string);
  #string = re.sub(r"(<__[^>]*>)", r"'\1'", string);
  #string = re.sub(r"'", r'"', string)
  #string = re.sub(r'": "{"', r'": {"', string)
  #string = re.sub(r'}"', "}", string)
  #string = re.sub(r': None', ": null", string)
  return string
def sendUserList():
  userList = []
  for client in list(clients):
    if client.username != "":
      userList.append(client.username)
  for client in list(clients):
    if client.username != "":
      client.connection.sendData("userList", sorted(userList))
def sendDealerNotification(msg):
  notificationObject = Object()
  notificationObject.str = msg
  for client in allClients():
    client.connection.sendData("notification",notificationObject)
  logger.gameEntry("Dealer: " + msg)

ws_handler = WS_Handler
ws_server = SimpleWebSocketServer('', ws_port, ws_handler)
ws_thread = threading.Thread(target = ws_server.serveforever)
ws_thread.deamon = True

http_handler = HTTP_Handler
SocketServer.TCPServer.allow_reuse_address = True
http_server = SocketServer.TCPServer(("", http_port), http_handler)
http_thread = threading.Thread(target = http_server.serve_forever)
http_thread.deamon = True

trumps = 5 # no trumps
clients = []
thisGame = GameMachine()

if __name__ == "__main__":

  logger.mainEntry("OzWeb500Server launched.")
  logger.mainEntry("Client available at: http://" + server_hostname + ":" + str(http_port))

  ws_thread.start()
  logger.sockEntry("Web Socket Server started.")
  http_thread.start()
  logger.httpEntry("HTTP Server started.")

  def close_sig_handler(signal, frame):
    print " "
    logger.mainEntry("OzWeb500Server terminating.")
    http_server.shutdown()
    logger.httpEntry("HTTP Server stopped.")
    ws_server.close()
    logger.sockEntry("Web Socket Server stopped.")
    sys.exit()

  signal.signal(signal.SIGINT, close_sig_handler)

  while True:
    logger.gameEntry("Game State is '" + thisGame.state + "'")
    logger.mainEntry("Pinging Clients.")
    for client in list(clients):
      client.connection.sendData("ping", logger.datetime_str())

    time.sleep(300)
