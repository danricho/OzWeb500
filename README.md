# OzWeb500
This is a web-based multi-player implementation of the Australian card game '500', which is similar to 'Euchre'.
[GitHub Page for this project](http://danricho.github.io/OzWeb500/)
##Features
###Python Server:
- Full logging capability with time-stamping to file and screen.
- HTTP server integrated for ease of use. No local, out-of-date clients.
- WebSocket client tracking.
- JSON messaging format.
- Asynchronous, event driven framework.

###HTML/JavaScript Web Client:
- Lightweight. No images.
- Automated implementation with server driven actions.
- Simple implementation.

###Desktop Client (Future):
- Should be a simple port from the Web Client above.
- Intend to utilise the github "electron" framework.

###Game Play (Future):
- I have previously written a working version of the card game.
- It should be a matter of rolling my existing python logic into the new framework.

##Current Version
The current available version is "Pre-Release" and only exists as a release as it is a reasonably bare framework which can be used for other projects which require a websocket/http server and client implementation.

##Credit
I have used the following resources for this project.  
All credit goes to the respective authors.  
Note that my repo contains the needed files to run and I have modified all of them to some degree.
* Simple-Websocket-Server
 * Author: dpallot
 * [GitHub Repo](https://github.com/dpallot/simple-websocket-server)
* JQuery Filter Input v1.5.3
 * Author: Rudolf Naprstek
 * [Web Link](http://www.thimbleopensource.com/tutorials-snippets/jquery-plugin-filter-text-input)
* Gritter for jQuery v1.7.4
 * Author: Jordan Boesch
 * [Web Link](http://www.boedesign.com)
* leanModal v1.1
 * Author: Ray Stone
 * [Web Link](http://finelysliced.com.au)
