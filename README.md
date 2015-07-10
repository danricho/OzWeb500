# OzWeb500
This is a web-based multi-player implementation of the Australian version of the card game '500', which is similar to 'Euchre'.
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
- Intend to utilise the github [electron](https://github.com/atom/electron) framework.

###Game Play (Future):
- I have previously written a working version of the card game.
- It should be a matter of rolling my existing python logic into the new framework.

##Current Version
The current available version is "Pre-Release" and only exists as a release as it is a reasonably bare framework which can be used for other projects which require a websocket/http server and client implementation.

##Credit
I have used the following resources for this project.  
All credit goes to the respective authors.  
Note that my repo contains the needed files to run and I have modified all of them to some degree.

####Server End - Python:
* Simple-Websocket-Server by dpallot
  * [GitHub Repo](https://github.com/dpallot/simple-websocket-server)
* Transitions - Finite State Machine Implementation by Tal Yarkoni
  * [GitHub Repo](https://github.com/tyarkoni/transitions)
* Inspiration from: ThinkPython Card Class by Allen Downey
  * [GitHub Repo](https://github.com/AllenDowney/ThinkPython)

####Web Client - Javascript/JQuery:
* JQuery Filter Input v1.5.3 by Rudolf Naprstek
  * [Web Link](http://www.thimbleopensource.com/tutorials-snippets/jquery-plugin-filter-text-input)
  * [GitHub Repo](https://github.com/frodik/jquery.filter.input)
* Gritter for jQuery v1.7.4 by Jordan Boesch
  * [Web Link](http://www.boedesign.com)
  * [GitHub Repo](https://github.com/jboesch/Gritter)
* leanModal v1.1 by Author: Ray Stone
  * [Web Link](http://finelysliced.com.au)
  * [GitHub Repo](https://github.com/FinelySliced/leanModal.js)
