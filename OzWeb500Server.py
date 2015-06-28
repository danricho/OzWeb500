#!/usr/bin/python
# -*- coding: utf-8 -*-

import signal, json, time, sys, traceback, threading, re, socket

import logger
from SimpleWebSocketServer import WebSocket, SimpleWebSocketServer
import SimpleHTTPServer, SocketServer

class Object(object): pass;

dealer_lag = 0.25
ws_port = 8000
http_port = 8001
http_root = "www/"
server_version = 0.1
server_hostname = socket.gethostname()

clients = []

def username2client(username):
  for client in list(clients):
    if client.username == username:
      return client
  return False
def usernameRequest(conn, username):
  if username2client(username):
    conn.sendData("usernameExists")
    logger.sockEntry(str(conn.address[0]) + '-' + str(conn.address[1]) + ': Username request denied - exists ('+username +').')
  else:
    conn.setUsername(username)
    conn.sendData("loginAccepted", username)
    logger.sockEntry(str(conn.address[0]) + '-' + str(conn.address[1]) + ': Username accepted ('+username +').')
    sendClientData(conn)
    sendUserList(conn)

def pong(conn, pingStampStr):
  conn.getClient().latency = logger.secondsSinceDateTimeStr(pingStampStr)
  sendClientData(conn)
def sendChatOut(conn, msg):
  chatObject = Object()
  chatObject.fromUser = conn.getUsername()
  chatObject.message = msg
  for client in list(clients):
    client.connection.sendData("chatMessage",chatObject)
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
  return string
def sendUserList(conn):
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
    newUser.username = ""
    newUser.latency = 0.000
    clients.append(newUser)
    logger.sockEntry(str(self.address[0]) + '-' + str(self.address[1]) + ': New socket connection.')
    self.sendData("loginRequest")
    self.sendData("serverVersion",server_version)
    self.sendData("ping", logger.datetime_str())
  def handleClose(self):
    clients.remove(self.getClient())
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
