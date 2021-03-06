PURPLE="\033[95m"
CYAN="\033[96m"
DARKCYAN="\033[36m"
BLUE="\033[94m"
GREEN="\033[92m"
YELLOW="\033[93m"
RED="\033[91m"
BOLD="\033[1m"
UNDERLINE="\033[4m"
CLEAR="\033[0m"

import datetime

# serverLog = open("logs/"+datetime.datetime.now().strftime('%Y%m%d.%H%M%S')+"_ozWeb500_server.log",'w')
serverLog = open("logs/last_log.log",'w')

def time_str():
  return datetime.datetime.now().strftime('%H:%M:%S.%f')[:-3]

def datetime_str():
  return datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]

def mainEntry(entry, serverLogEntry=True):
  print RED + BOLD + "[" + time_str() + " " + "MAIN" + "] " + CLEAR + entry
  if serverLogEntry:
    serverLog.write("[" + datetime_str() + " " + "MAIN" + "] " + entry + "\n")

def sockEntry(entry, serverLogEntry=True):
  print GREEN + BOLD + "[" + time_str() + " " + "SOCK" + "] " + CLEAR + entry
  if serverLogEntry:
    serverLog.write("[" + datetime_str() + " " + "SOCK" + "] " + entry + "\n")

def httpEntry(entry, serverLogEntry=True):
  print BLUE + BOLD + "[" + time_str() + " " + "HTTP" + "] " + CLEAR + entry
  if serverLogEntry:
    serverLog.write("[" + datetime_str() + " " + "HTTP" + "] " + entry + "\n")

def dbugEntry(entry, serverLogEntry=True):
  print YELLOW + BOLD + "[" + time_str() + " " + "DBUG" + "] " + CLEAR + entry
  if serverLogEntry:
    serverLog.write("[" + datetime_str() + " " + "DBUG" + "] " + entry + "\n")

def gameEntry(entry, serverLogEntry=True):
  print PURPLE + BOLD + "[" + time_str() + " " + "GAME" + "] " + CLEAR + entry
  if serverLogEntry:
    serverLog.write("[" + datetime_str() + " " + "GAME" + "] " + entry + "\n")


def secondsSinceDateTimeStr(str):
  now = datetime.datetime.now()
  since = datetime.datetime.strptime(str, '%Y-%m-%d %H:%M:%S.%f')
  loopback = now - since
  return loopback.total_seconds()
