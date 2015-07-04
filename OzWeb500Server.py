#!/usr/bin/python
# -*- coding: utf-8 -*-

import signal, json, time, sys, traceback, threading, re, socket, os, random
os.system('clear')

import logger
from SimpleWebSocketServer import WebSocket, SimpleWebSocketServer
import SimpleHTTPServer, SocketServer

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

trumps = 5 # no trumps

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
    return '{"suit":'+str(self.suit)+',"rank":'+str(self.rank)+'}'
class Deck(object):
  def __init__(self,fill=True):
    self.cards=[]
    if fill:
      for suit in range(1,3): # Create the black cards
        for rank in range(3, 15):
          new_card = Card(suit, rank)
          self.cards.append(new_card)
      for suit in range(3,5): # Create the red cards
        for rank in range(4, 15):
          new_card = Card(suit, rank)
          self.cards.append(new_card)
      new_card = Card(5, 15) # create the Joker
      self.cards.append(new_card)
  def __str__(self):
    string = ""
    for card in self.cards:
      string = string + str(card) + "\n"
    return string[:-1]
  def addCard(self,card):
    self.cards.append(card)
  def removeCard(self,card):
    self.cards.remove(card)
  def removeCardIndex(self,index):
    del self.cards[index]
  def popCard(self,i=-1):
    return self.cards.pop(i)
  def moveCards(self,otherDeck,num):
    for i in range(num):
      otherDeck.addCard(self.popCard())
  def sort(self):
    self.cards.sort()
  def shuffle(self):
    random.shuffle(self.cards)
  def getIndex(self,findcard):
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
    string = "["
    for card in self.cards:
      string = string + card.jsonStr() + ","
    return string[:-1] + "]"

dealer_deck = Deck()
kitty = Deck(False)

clients = []
players = [None,None,None,None]

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
def username2client(username):
  for client in list(clients):
    if client.username == username:
      return client
  return None
def usernameRequest(conn, username):
  if username2client(username):
    conn.sendData("usernameExists")
    logger.sockEntry(str(conn.address[0]) + '-' + str(conn.address[1]) + ': Username request denied - exists (' + username + ').')
  else:
    conn.setUsername(username)
    conn.sendData("loginAccepted", username)
    logger.sockEntry(str(conn.address[0]) + '-' + str(conn.address[1]) + ': Username accepted ('+username +').')
    sendClientData(conn)
    sendUserList()
    sendPlayersStatus(conn)
    sendLoginNotification(conn)

def pong(conn, pingStampStr):
  conn.getClient().latency = logger.secondsSinceDateTimeStr(pingStampStr)
  if conn.getUsername():
    logger.sockEntry(conn.getUsername() + ': latency updated to ' + str(conn.getClient().latency) + '.')
  else:
    logger.sockEntry(str(conn.address[0]) + '-' + str(conn.address[1]) + ': latency updated to ' + str(conn.getClient().latency) + '.')
  sendClientData(conn)
def sendChatOut(conn, msg):
  chatObject = Object()
  chatObject.fromUser = conn.getUsername()
  chatObject.message = msg
  logger.sockEntry(chatObject.fromUser + ' said: ' + chatObject.message)
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
def sendPlayersStatus(conn):
  conn.sendData("playerStatus",players)
def sendClientData(conn):
  userdata = conn.getClient()
  conn.sendData("clientData",userdata)
def cleanJSONstring(string):
  """ These are regular expressions to correct the format for send client objects """
  string = re.sub(r"': u'", r"': '", string);
  string = re.sub(r"(<__[^>]*>)", r"'\1'", string);
  string = re.sub(r"'", r'"', string)
  string = re.sub(r'": "{"', r'": {"', string)
  string = re.sub(r'}"', "}", string)
  string = re.sub(r': None', ": null", string)
  return string
def sendUserList():
  userList = []
  for client in list(clients):
    if client.username != "":
      userList.append(client.username)
  for client in list(clients):
    if client.username != "":
      client.connection.sendData("userList", sorted(userList))

class WS_Handler(WebSocket):
  def sendData(self, message_type, message_data = None):
    toSend = Object()
    toSend.header = message_type
    if message_data != None:
      if isinstance(message_data, Object):
        toSend.data = str(message_data.__dict__)
      else:
        toSend.data = message_data
    string = unicode(json.dumps(toSend.__dict__))
    string = cleanJSONstring(string)
    # print "outgoing", string
    self.sendMessage(string)
  def getClient(self):
    for client in list(clients):
      if client.connection == self:
        return client
    return False
  def getUsername(self):
    for client in list(clients):
      if client.connection == self:
        return client.username
    return False
  def setUsername(self, username):
    for client in list(clients):
      if client.connection == self:
        client.username = username
  def handleMessage(self):
    # print "incoming", self.data
    message = json.loads(self.data)
    if message['header'] == "usernameRequest":
      usernameRequest(self, message['data'])
    elif message['header'] == "pong":
      pong(self, message['data'])
    elif message['header'] == "chat":
      sendChatOut(self, message['data'])
  def handleConnected(self):
    newUser = Object()
    newUser.connection = self
    newUser.username = None
    newUser.latency = 0.000
    clients.append(newUser)
    logger.sockEntry(str(self.address[0]) + '-' + str(self.address[1]) + ': New socket connection.')
    self.sendData("loginRequest")
    self.sendData("serverVersion",server_version)
    self.sendData("ping", logger.datetime_str())
  def handleClose(self):
    sendLeftNotification(self)
    clients.remove(self.getClient())
    sendUserList()
    logger.sockEntry(str(self.address[0]) + '-' + str(self.address[1]) + ': Socket connection disconnected.')
class HTTP_Handler(SimpleHTTPServer.SimpleHTTPRequestHandler):
  def log_message(self, format, *args):
    # override logging output
    if "index.html" in str(format%args):
      logger.httpEntry(str(self.address_string()) + " - " + str(format%args));
  def translate_path(self, path):
    path = http_root + path
    return path

ws_handler = WS_Handler
ws_server = SimpleWebSocketServer('', ws_port, ws_handler)
ws_thread = threading.Thread(target = ws_server.serveforever)
ws_thread.deamon = True

http_handler = HTTP_Handler
SocketServer.TCPServer.allow_reuse_address = True
http_server = SocketServer.TCPServer(("", http_port), http_handler)
http_thread = threading.Thread(target = http_server.serve_forever)
http_thread.deamon = True

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
    logger.mainEntry("Pinging Clients.", False)
    for client in list(clients):
      client.connection.sendData("ping", logger.datetime_str())
    time.sleep(300)
