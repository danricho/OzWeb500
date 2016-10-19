/* SETTINGS */
client_version = 0.1
WebSocket_Add = window.location.hostname
WebSocket_Port = "8000"
var clientData;

/* CARD RELATED CONSTANTS */
/// SUIT index ranges from 1 to 5.
SUIT_str  = [null,"Clubs","Spades","Diamonds","Hearts","No Trumps"]
SUIT_disp = [null,"♣","♠","♦","♥",""]
SUIT_col  = [null,"black","black","red","red","black"]
/// RANK index ranges from 3 to 15.
RANK_str  = [null,null,null,"3","4","5","6","7","8","9","10","Jack","Queen","King","Ace","Joker"]
RANK_disp = [null,null,null,"3","4","5","6","7","8","9","10","J","Q","K","A","Jok"]

// Logger
myLogger = {
  timestamp(cat){
    now = new Date();
    string = "[";
    string += now.getHours() + ":";
    string += (now.getMinutes()<10?'0':'') + now.getMinutes() + ":";
    string += (now.getSeconds()<10?'0':'') + now.getSeconds() + ".";
    string += (now.getMilliseconds()<100?'0':now.getMilliseconds()<10?'00':'') + now.getMilliseconds();
    if (cat != ""){
      string += " " + cat;
    };
    string += "] ";
    return string;
  },
  groupStart(cat, colr, string){
    console.groupCollapsed("%c" + myLogger.timestamp(cat) + string, "color:" + colr + ";font-weight:bold;");
  },
  groupLine(string){
    console.log(string);
  },
  groupEnd(string){
    console.groupEnd();
  },
  line(cat, colr, string){
    console.log("%c" + myLogger.timestamp(cat) + string, "color:" + colr + ";font-weight:bold;");
  },
}

// DO FUNCTIONS
// WebSocket Doers
function doWsConnect() {
  websocket = new WebSocket("ws://" + WebSocket_Add + ":" + WebSocket_Port);
  websocket.onopen = function(evt) {
    onWebSockOpen(evt)
  };
  websocket.onclose = function(evt) {
    onWebSockClose(evt)
  };
  websocket.onmessage = function(evt) {
    onWebSockMessage(evt)
  };
  websocket.onerror = function(evt) {
    onWebSockError(evt)
  };
}
function doWsDisconnect() {
  websocket.close();
}
function doWsSend(type, dataIn) {
  message = {
    header: type,
    data: dataIn
  }
  websocket.send(JSON.stringify(message));
  myLogger.groupStart("WS-SNT", "green", message.header);
  console.log("Sent Data: " + message.data);
  myLogger.groupEnd();
}
// Send Message Doers
function doSendLoginReguest() {
  var desired_username = $("#inputUsername").val();
  myLogger.groupStart("USR_IN", "blue", "Login as (" + desired_username + ")");
  if (desired_username == "") {
    console.log("Username Empty: Setting Feedback.");
    doDisplayLoginFeedback("Enter a username!", true);
    myLogger.groupEnd();
  }
  else if (desired_username.length < 3) {
    console.log("Username too short: Setting Feedback.");
    doDisplayLoginFeedback("Username is too short (min 3).", true);
    myLogger.groupEnd();
  }
  else if (desired_username.length > 10) {
    console.log("Username too long: Setting Feedback.");
    doDisplayLoginFeedback("Username is too long (max 10).", true);
    myLogger.groupEnd();
  }
  else {
    console.log("Sending usernameRequest message.");
    doDisplayLoginFeedback("Requesting username...", false);
    myLogger.groupEnd();
    doWsSend("usernameRequest", desired_username);
  }
}
function doSendChatMessage() {
  chat_message = $('#inputChat').val()
  chat_message = chat_message.replace(/["]/g, "&#34;");
  chat_message = chat_message.replace(/[']/g, "&#39;");
  doWsSend("chat", chat_message);
  $('#inputChat').val("");
}
function doSendSeatRequest(seat){
  myLogger.groupStart("USR_IN", "blue", "Requesting seat " + seat);
  myLogger.groupEnd();
  doWsSend("seatRequest", seat);
}
// Display Info Doers
function doDisplayLoginFeedback(str, red) {
  if (str==""){
    $("#feedbackLogin").html("").removeClass("red").show();
  }else{
    if (red) {
      $("#feedbackLogin").html(str).addClass("red").show();
    } else {
      $("#feedbackLogin").html(str).removeClass("red").show();
    }
  }
}
function doDisplayConnectionStatus(status) {
  if (status) {
    $("#ws_conn_status").removeClass("red").attr('title', 'Connected to Server.');
  } else {
    $("#ws_conn_status").addClass("red").attr('title', 'Not Connected to Server.');
  }
}
function doDisplayLoginStatus(username) {
  if (username == "") {
    $("#usernameDisp").text("");
    $("#login_status").addClass("red").attr('title', 'Not logged in.');
  } else {
    $("#usernameDisp").text(username);
    $("#login_status").removeClass("red").attr('title', 'Logged in as ' + username + '.');
  }
}
function doDisplayVersionInfo(server_version, client_version) {
  $("#title").attr('title', "Server v" + server_version + " : Client v" + client_version);
}
function doDisplayPageTitle(username) {
  if (username == "") {
    document.title = "OzWeb500";
  } else {
    document.title = "OzWeb500 : " + username;
  }
}
function doDisplayUserList(users) {
  $("#userList").html("");
  $.each(users, function(index, value) {
    if (value) {
      $("#userList").append("<p>" + value + "</p>");
    }
  });
}
function doDisplayCardFront(card,suit,rank){
  $(card + "> face#front").removeClass("red").removeClass("black").addClass(SUIT_col[suit]);
  if (rank == 15){
    $(card + "> face#front .big #rank").html('<svg xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" xmlns:cc="http://creativecommons.org/ns#" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:svg="http://www.w3.org/2000/svg" xmlns:ns1="http://sozi.baierouge.fr" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" sodipodi:docname="Joker face.svg" inkscape:version="0.48.1 " style="padding-top:10px;padding-left:5px;" x="0px" y="0px" width="90px" height="90px" viewBox="205.167 202.1 287.914 289.701" enable-background="new 205.167 202.1 287.914 289.701" xml:space="preserve">      <sodipodi:namedview inkscape:window-maximized="1" showguides="true" borderopacity="1" objecttolerance="10" showgrid="false" gridtolerance="10" inkscape:zoom="0.41617064" pagecolor="#ffffff" inkscape:cy="671.41993" guidetolerance="10" inkscape:cx="703.87785" bordercolor="#666666" inkscape:window-y="25" inkscape:pageopacity="0" inkscape:window-height="968" inkscape:window-width="1278" inkscape:window-x="1" inkscape:pageshadow="2" inkscape:current-layer="svg2"/>      <path inkscape:connector-curvature="0" sodipodi:nodetypes="cscc" fill="#FFFFFF" stroke="#000000" stroke-width="5.6693" d="M387.936 395.129c25.212-2.447 31.922-10.386 30.318-20.794 -0.742-4.82-5.123-5.997-8.42-11.576 2.402-19.903-7.467-18.673-15.534-28.251l2.403 2.12c-20.176-12.147-31.814-0.496-44.55 8.1 -5.717-12.151-11.278-25.049-21.852-30.949 -23.073-12.874-53.159-9.019-62.85-7.583 -27.985 4.148-26.746 35.732-26.676 53.718l0.002 0.005"/>      <path inkscape:connector-curvature="0" sodipodi:nodetypes="cscscscscccssc" fill="#488C23" stroke="#000000" stroke-width="5.6693" d="M240.778 359.919c-1.36-15.286 0.555-32.504 11.229-49.878 23.628-38.457 75.065-77.675 122.015-98.388 11.327-2.04 19.94 1.375 26.854 8.206 16.655 16.454 23.451 52.727 34.566 80.319 4.737 6.529 8.656 9.199 12.126 9.761 6.746 1.094 11.799-5.778 17.897-7.736 -10.563 2.478-8.078 44.913-46.396 16.042 -6.799-5.123-11.752-15.145-22.366-39.329v57.712c-20.176-12.147-31.814-0.496-44.55 8.1 -5.717-12.151-11.278-25.049-21.852-30.949 -23.073-12.874-53.159-9.019-62.85-7.583 -27.985 4.148-26.746 35.732-26.676 53.718L240.778 359.919z"/>      <path inkscape:connector-curvature="0" sodipodi:nodetypes="csccc" fill="#1818F2" stroke="#000000" stroke-width="5.6693" d="M366.756 248.265c0 13.924-10.491 25.211-23.432 25.211 -12.939 0-24.457-12.899-24.457-26.823 11.777-11.606 27.198-20.474 33.318-22.576C361.895 227.157 366.756 236.82 366.756 248.265L366.756 248.265z"/>      <path inkscape:transform-center-y="-111.83871" inkscape:transform-center-x="60.606862" sodipodi:cx="526.625" sodipodi:cy="742.5249" sodipodi:ry="1.5258964" sodipodi:type="arc" sodipodi:rx="0.76294822" fill="#1818F2" stroke="#000000" stroke-width="5.6693" d="M388.746 298.372c0.063 12.743-9.569 23.128-21.513 23.194 -11.945 0.067-21.68-10.209-21.742-22.952 0-0.082 0-0.162 0-0.243 -0.063-12.743 9.569-23.128 21.513-23.194 11.946-0.067 21.68 10.208 21.742 22.952C388.746 298.21 388.746 298.291 388.746 298.372z"/>      <path inkscape:connector-curvature="0" sodipodi:nodetypes="ccccscc" fill="#1818F2" stroke="#000000" stroke-width="5.6693" d="M310.723 289.775c0 5.089-1.58 9.789-4.246 13.584 -11.247 1.04-23.241 1.318-33.388 1.785 -3.503-4.056-5.638-9.45-5.638-15.37 5.92-7.693 13.835-16.45 19.544-20.512 2.876-2.046 2.379-2.1 6.474-1.848C303.318 269.552 310.723 278.751 310.723 289.775L310.723 289.775z"/>      <path inkscape:connector-curvature="0" sodipodi:nodetypes="ccccsccccc" fill="#FFFFFF" stroke="#000000" stroke-width="5.6693" stroke-linecap="round" d="M352.64 357.892c4.416 6.888 12.986 11.606 5.326 24.807 11.456-13.71 15.566-12.063 20.854-12.881 8.772 5.225 9.86 14.508 7.382 24.328 -5.034 14.946-11.993 36.202-29.688 33.104 -4.559 10.563-9.198 18.192-22.675 27.636 -7.854 5.504-21.819 13.164-32.346 18.333 -13.624 6.556-31.536 15.645-43.212 8.517 -7.634-6.509-11.067-16.137-13.806-26.232 -4.858-17.806-15.628-38.249-9.989-57.109l5.909-17.227 0.384-21.247"/>      <path inkscape:connector-curvature="0" fill="none" stroke="#000000" stroke-width="5.6693" d="M262.57 361.186l-19.37 0.253"/>      <path sodipodi:cx="478.7977" sodipodi:cy="763.69672" sodipodi:ry="2.4795816" sodipodi:type="arc" sodipodi:rx="2.3365288" stroke="#000000" stroke-width="5.6693" stroke-linecap="round" stroke-linejoin="round" d="M257.156 359.332c0 3.968-3.077 7.186-6.873 7.186s-6.873-3.218-6.873-7.186c0-3.969 3.077-7.186 6.873-7.186S257.156 355.363 257.156 359.332L257.156 359.332z"/>      <path inkscape:connector-curvature="0" fill="none" stroke="#000000" stroke-width="5.6693" d="M250.95 343.72l-0.485 27.084"/>      <path inkscape:connector-curvature="0" sodipodi:nodetypes="cc" fill="none" stroke="#000000" stroke-width="5.6693" stroke-linecap="round" d="M262.857 358.729c0.406 6.425-0.294 11.114-1.712 14.677"/>      <path inkscape:connector-curvature="0" sodipodi:nodetypes="ccccccscccccc" fill="#E50000" stroke="#000000" stroke-width="5.6693" d="M256.399 414.975c5.585 0.342 16.32-0.737 21.915-1.215 11.585-3.447 21.859-10.502 32.682-17.393 13.076-6.518 25.232-11.695 25.596 0.313 -0.827 5.92-3.07 11.313-8.278 15.598 -4.087 2.359-7.316 4.82-10.377 8.457 -4.317 5.322-8.198 10.954-11.896 16.729 -3.993 6.237-7.77 12.642-11.651 19.008 -9.137 11.768-14.458 29.92-32.544 26.718 -9.989-6.806-12.482-18.126-17.917-28.603 -1.211-0.253-7.506-26.325-7.506-26.325l-3.39-26.072C245.841 402.022 246.414 413.926 256.399 414.975L256.399 414.975z"/>      <path inkscape:connector-curvature="0" sodipodi:nodetypes="cscc" fill="#960007" stroke="#000000" stroke-width="5.6693" stroke-linecap="round" stroke-linejoin="round" d="M237.653 408.416c-13.469 0-24.343-10.917-24.387-24.383 -0.045-13.301 10.009-23.149 24.387-24.383 56.059 14.659 36.569 46.911 0 48.764V408.416z"/>      <path inkscape:connector-curvature="0" sodipodi:nodetypes="cc" fill="none" stroke="#000000" stroke-width="5.6693" stroke-linecap="round" d="M409.835 360.407c-4.461 3.128-8.079 3.62-11.643 3.938"/>      <path inkscape:connector-curvature="0" sodipodi:nodetypes="ccc" fill="none" stroke="#000000" stroke-width="5.6693" stroke-linecap="round" d="M272.887 348.234c4.425-11.221 9.033-15.286 19.724-18.915 17.988-2.63 31.157 18.561 44.994 36.456"/>      <path inkscape:connector-curvature="0" sodipodi:nodetypes="cc" fill="none" stroke="#000000" stroke-width="5.6693" stroke-linecap="round" d="M259.532 346.804c-2.008-10.384-5.207-18.732-17.12-12.171"/>      <path inkscape:connector-curvature="0" sodipodi:nodetypes="ccc" fill="none" stroke="#000000" stroke-width="5.6693" stroke-linecap="round" d="M310.891 347.16c7.706 15.799 4.66 28.611-2.458 36.1 -25.104 18.461-38.574-4.462-38.632-21.422"/>      <path sodipodi:cx="478.7977" sodipodi:cy="763.69672" sodipodi:ry="2.4795816" sodipodi:type="arc" sodipodi:rx="2.3365288" stroke="#000000" stroke-width="5.6693" stroke-linecap="round" stroke-linejoin="round" d="M304.388 368.298c0 5.14-3.756 9.308-8.389 9.308 -4.633 0-8.389-4.167-8.389-9.308 0-5.141 3.756-9.308 8.389-9.308C300.633 358.99 304.388 363.158 304.388 368.298L304.388 368.298z"/>      <path inkscape:connector-curvature="0" fill="none" stroke="#000000" stroke-width="5.6693" d="M295.141 345.729v42.601"/>      <path inkscape:connector-curvature="0" fill="none" stroke="#000000" stroke-width="5.6693" d="M277.583 368.021l36.56 0.506"/>      <path inkscape:connector-curvature="0" sodipodi:nodetypes="cccc" fill="none" stroke="#000000" stroke-width="5.6693" stroke-linecap="round" d="M375.639 391.306c-0.225-10.215-2.04-9.797-4.21-7.009 -2.828 3.271-2.127 7.565-2.79 11.801 -1.207 4.623-1.645 6.525-4.379 11.408"/>      <path inkscape:connector-curvature="0" sodipodi:nodetypes="cc" fill="none" stroke="#000000" stroke-width="5.6693" stroke-linecap="round" d="M387.68 394.055c9.899-3.669 11.136-9.528 13.386-15.658"/>      <path inkscape:connector-curvature="0" sodipodi:nodetypes="ccccc" fill="#575757" stroke="#000000" stroke-width="5.6693" d="M297.961 418.268c7.997-4.018-14.496 25.48-23.581 35.604 -10.556 10.223-18.79 4.898-24.78-15.427 -8.039-15.49-10.473-20.032 1.546-14.721 16.54 11.586 29.508-4.371 46.816-5.456H297.961z"/>      <path sodipodi:cx="526.625" sodipodi:cy="742.5249" sodipodi:ry="1.5258964" sodipodi:type="arc" sodipodi:rx="0.76294822" fill="#1818F2" stroke="#000000" stroke-width="5.6693" d="M486.533 301.758c0.042 8.615-6.438 15.635-14.472 15.68 -8.035 0.046-14.584-6.901-14.626-15.516 0-0.055 0-0.109 0-0.164 -0.042-8.615 6.438-15.635 14.473-15.68 8.035-0.045 14.583 6.901 14.625 15.516C486.533 301.649 486.533 301.704 486.533 301.758z"/></svg>');
    $(card + "> face#front .big #suit").html("");
    $(card + "> face#front .index #rank").html("<p style='padding-top:10px;line-height:12px;font-size:15px;'>J<br/>O<br/>K<br/>E<br/>R</p>");
    $(card + "> face#front .index #suit").html("");
    return_string = "Joker(s) displayed.";
  }else{
    $(card + "> face#front #rank").html(RANK_disp[rank]);
    $(card + "> face#front #suit").html(SUIT_disp[suit]);
    return_string = RANK_disp[rank] + " of " + SUIT_str[suit] + " card(s) displayed.";
  }
  $(card + "> face#back").fadeOut(50);
  $(card + "> face#front").fadeIn(50);
  $(card).fadeIn(50);
  return return_string;
}
function doDisplayCardBack(card){
  $(card + "> face#front").removeClass("red").removeClass("black")
  $(card + "> face#front").fadeOut(50);
  $(card + "> face#back").fadeIn(50);
  $(card).fadeIn(50);
  return "Back of card(s) displayed.";
}
function doDisplayHideCard(card){
  $(card).fadeOut(50);
  return "Card(s) hidden.";
}
function doDisplayUpdateCards(updatedCards){
  updatedCards.myHand = updatedCards.myHand.cards
  console.log(updatedCards)
  for (var i = 1; i < 13; i++){
    //$("#myHand #card_"+i)
    if (updatedCards.previousHand >= i ){
      doDisplayCardBack("#previousHand #card_"+i);
    }else{
      doDisplayHideCard("#previousHand #card_"+i);
    }
    if (updatedCards.nextHand >= i ){
      doDisplayCardBack("#nextHand #card_"+i);
    }else{
      doDisplayHideCard("#nextHand #card_"+i);
    }
    if (updatedCards.partnerHand >= i ){
      doDisplayCardBack("#partnerHand #card_"+i);
    }else{
      doDisplayHideCard("#partnerHand #card_"+i);
    }
    if (updatedCards.myHand.length > i-1){
      doDisplayCardFront("#myHand #card_"+i, updatedCards.myHand[i-1].suit, updatedCards.myHand[i-1].rank);
    }else{
      doDisplayHideCard("#myHand #card_"+i);
    }
  }
  for (var i = 1; i <= 3; i++){
    if (updatedCards.kitty >= i ){
      doDisplayCardBack("#tableKitty"+i);
    }else{
      doDisplayHideCard("#tableKitty"+i);
    }
  }
}
// Input Availability Doers
function doInputChatAvailable(state) {
  if (state) {
    $("#inputChat").prop('disabled', false);
  } else {
    $("#inputChat").prop('disabled', true);
  }
}
function doInputSeatAvailable(players){
  for (var i = 1; i < 5; i++){
    if (typeof clientData !== 'undefined' && typeof clientData.seat !== 'undefined'){
      // I'm sitting!
      if (clientData.seat-i == 0) { // it's my seat...
        $("#mySeatButton").val(players[i]);
        $("#mySeatButton").prop('disabled', true);
        $("#unMy").text(players[i]);
      } else if (clientData.seat-i == -3 || clientData.seat-i == 1) { // previous seat
        if (players[i] == null) {
          $("#previousSeatButton").val('Sit Here');
          $("#previousSeatButton").prop('disabled', false);
          $("#unPrevious").text('Empty');
        }else{
          $("#previousSeatButton").val(players[i]);
          $("#previousSeatButton").prop('disabled', true);
          $("#unPrevious").text(players[i]);
        }
      } else if (clientData.seat-i == 3 || clientData.seat-i == -1) { // next seat
        if (players[i] == null) {
          $("#nextSeatButton").val('Sit Here');
          $("#nextSeatButton").prop('disabled', false);
          $("#unNext").text('Empty');
        }else{
          $("#nextSeatButton").val(players[i]);
          $("#nextSeatButton").prop('disabled', true);
          $("#unNext").text(players[i]);
        }
      } else if (clientData.seat-i == 2 || clientData.seat-i == -2) { // partner seat
        if (players[i] == null) {
          $("#partnerSeatButton").val('Sit Here');
          $("#partnerSeatButton").prop('disabled', false);
          $("#unPartner").text('Empty');
        }else{
          $("#partnerSeatButton").val(players[i]);
          $("#partnerSeatButton").prop('disabled', true);
          $("#unPartner").text(players[i]);
        }
      }
    } else { // I'm not sitting.
      buttons = [null, "#mySeatButton", "#nextSeatButton", "#partnerSeatButton", "#previousSeatButton"];
      usernames = [null, "#unMy", "#unNext", "#unPartner", "#usPrevious"];
      if (players[i] == null) {
        $(buttons[i]).val('Sit Here');
        $(buttons[i]).prop('disabled', false);
        $(usernames[i]).text('Empty');
      }else{
        $(buttons[i]).val(players[i]);
        $(buttons[i]).prop('disabled', true);
        $(usernames[i]).text(players[i]);
      }
    }
  }
  // hide the sit buttons if all taken
  if ($(".Hand input.sit:enabled").length){
    $(".Hand input.sit").show();
    $(".Hand .upright").hide();
  }else{
    $(".Hand input.sit").hide();
    $(".Hand .upright").show();
  }
  console.log("players", players);
}
// Layout Adjustment Doers
function doLayoutVerticalCentre() {
  $('#table_cards').css({
    position: 'absolute',
    left: ($(window).width() - $('#table_cards').outerWidth()) / 2,
    top: ($(window).height() - $('#table_cards').outerHeight()) / 2 - 35
  });
  $('#previousHand, #nextHand, #loginmodal').each(function(i) {
    $(this).css({
      position: 'absolute',
      top: ($(window).height() - $(this).outerHeight()) / 2
    });
  });
}
function doLayoutShowModal(state) {
  if (state) {
    $("#modaltrigger").click();
  } else {
    doDisplayLoginFeedback("", false);
    $("#hide_modal").click();
  }
}

// ON FUNCTIONS
// WebSocket Reactions
function onWebSockOpen(evt) {
  console.clear()
  myLogger.groupStart("WS", "green", "Connected to server");
  console.log("Updating the connection status display to 'connected'.");
  doDisplayConnectionStatus(true);
  console.log("Open Event Data:", evt);
  myLogger.groupEnd();
}
function onWebSockClose(evt) {
  myLogger.groupStart("WS", "green", "Connection closed.");
  console.log("Updating the connection status display to 'not connected'.");
  doDisplayConnectionStatus(false);
  console.log("Updating the login status to 'not logged in'.");
  doDisplayLoginStatus("");
  console.log("Updating the page title to 'OzWeb500'.");
  doDisplayPageTitle("");
  console.log("Hiding the login modal.");
  doLayoutShowModal(false)
  console.log("Disabling chat input.");
  doInputChatAvailable(false);
  console.log("Close Event Data", evt)
  myLogger.groupEnd();
  doDisplayHideCard("card")

  setTimeout(function() {
      doWsConnect();
  }, 2500);

}
function onWebSockMessage(evt) {
  //console.log(evt.data)
  message = jQuery.parseJSON(evt.data);
  myLogger.groupStart("WS-REC", "green", message.header);
  switch (message.header) {
    case "serverVersion":
      console.log("Updating the title version data to 'Server v" + message.data + " : Client v" + client_version + "'.");
      doDisplayVersionInfo(message.data, client_version)
      myLogger.groupEnd();
      break;
    case "ping":
      console.log("Sending pong message.");
      myLogger.groupEnd();
      doWsSend("pong", message.data);
      break;
    case "loginRequest":
      console.log("Showing the login modal.");
      doLayoutShowModal(true);
      myLogger.groupEnd();
      break;
    case "usernameExists":
      console.log("Displaying login feedback (in red).");
      doDisplayLoginFeedback($("#inputUsername").val() + " is already logged in!", true);
      console.log("Clearing the entered username.");
      $("#inputUsername").val("");
      myLogger.groupEnd();
      break;
    case "loginAccepted":
      username = message.data;
      console.log("In 1 second:");
      console.log(" - Displaying login feedback (not red).");
      console.log(" - Updating the login status to 'logged in'.");
      console.log(" - Updating the page title to 'OzWeb500 : " + username + "'.");
      console.log(" - Enabling chat input.");
      console.log("In 2.5 seconds:");
      console.log(" - Hiding the login modal.");
      doDisplayLoginStatus(username);
      doDisplayPageTitle(username);
      doInputChatAvailable(true);
      myLogger.groupEnd();
      setTimeout(function() {
        doDisplayLoginFeedback("Login Successful.", false);
      }, 758);
      setTimeout(function() {
        doLayoutShowModal(false);
      }, 1500);
      break;
    case "userList":
      console.log("Updating user list.");
      doDisplayUserList(message.data);
      console.log("Received Data: ", message.data);
      myLogger.groupEnd();
      break;
    case "chatMessage":
      console.log("From: " + message.data.fromUser + ".");
      console.log("Message: " + message.data.message + ".");
      console.log("Displaying message.");
      onIncomingChatMessage(message.data.fromUser, message.data.message);
      myLogger.groupEnd();
      break;
    case "notification":
      console.log("Message: " + message.data.str + ".");
      console.log("Displaying notification.");
      onIncomingNotification(message.data.str);
      myLogger.groupEnd();
      break;
    case "seatsAvailability":
      console.log("Updating the seats available.");
      doInputSeatAvailable(message.data);
      myLogger.groupEnd();
      break;
    case "seatTaken":
      console.log("Seat is taken.");
      onIncomingAlert("Seat has already been taken!");
      myLogger.groupEnd();
      break;
    case "cardUpdate":
      console.log("Updating the player cards.");
      doDisplayUpdateCards(message.data);
      myLogger.groupEnd();
      break;
    case "clientData":
      clientData = message.data;
      console.log("Client Data: ", clientData);
      myLogger.groupEnd();
      break;
    default:
      console.log("Received Data: ", message.data);
      myLogger.groupEnd();
  }
}
function onWebSockError(evt) {
  myLogger.groupStart("WS", "green", "Connection error.");
  console.log("Error Event Data:", evt);
  myLogger.groupEnd();
}
// Incoming Message Reactions
function onIncomingChatMessage(frm, msg) {
  return $.gritter.add({
    title: frm + ":",
    text: msg,
    sticky: false,
    time: 7000,
    class_name: 'chatGritter'
  });
}
function onIncomingNotification(str) {
  return $.gritter.add({
    title: "",
    text: str,
    sticky: false,
    time: 4000,
    class_name: 'notificationGritter'
  });
}
function onIncomingAlert(str) {
  return $.gritter.add({
    title: "",
    text: str,
    sticky: true,
    class_name: 'alertGritter'
  });
}
function onIncomingError(str) {
  return $.gritter.add({
    title: "",
    text: str,
    sticky: true,
    class_name: 'errorGritter'
  });
}
// Document Loaded Reaction
$(document).ready(function() {
  // Setup Plugins
  $("#modaltrigger").leanModal({
    top: 200,
    overlay: 0.7,
    closeButton: "#hide_modal"
  });
  $("#inputUsername").filter_input({
    regex: '[a-zA-Z0-9_]',
    disallowed_feedback: function(char) {
      if (char.charCodeAt(0) == 13) { //enter press
        $("#buttonLogin").click();
      } else {
        if (char == " ") {
          char = "Spaces"
        } else {
          char = "'" + char + "'"
        }
        $("#feedbackLogin").html(char + " not allowed.").addClass("red").show();
      }
    },
    allowed_feedback: function(char) {
      if (char == " ") {
        char = "Spaces"
      } else {
        char = "'" + char + "'"
      }
      $("#feedbackLogin").html("").removeClass("red").hide();
    }
  });
  $.extend($.gritter.options, {
    position: 'bottom-right',
    fade_in_speed: 'fast',
    fade_out_speed: 'fast',
    time: 4000
  });

  // Set Triggers
  $(window).resize(doLayoutVerticalCentre);
  $("#buttonLogin").click(doSendLoginReguest);
  $("#users").hover(
    function() {
      if ($("#usernameDisp").text() != "") {
        $("#userList").show();
      }
    },
    function() {
      $("#userList").hide();
    }
  );
  $('#inputChat').keypress(function(e) {
    if (e.which == 13) {
      doSendChatMessage();
    }
  });
  $("#mySeatButton").click(function(){doSendSeatRequest(1);});
  $("#nextSeatButton").click(function(){doSendSeatRequest(2);});
  $("#partnerSeatButton").click(function(){doSendSeatRequest(3);});
  $("#previousSeatButton").click(function(){doSendSeatRequest(4);});
  $("#enableAuto").click(function(){AutoTester.start();});
  // Start the Fun
  doLayoutVerticalCentre();
  doWsConnect();
  


});

AutoTester = {
  randomStringGenerator(lng) {
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz!#$%&*";
    var string_length = lng;
    var randomstring = '';
    for (var i = 0; i < string_length; i++) {
      var rnum = Math.floor(Math.random() * chars.length);
      randomstring += chars.substring(rnum, rnum + 1);
    }
    return randomstring;
  },
  randomGOTusernameGenerator() {
    var names = [
      "Arya",
      "Sansa",
      "Catelyn",
      "Rickon",
      "Rickard",
      "Bran",
      "Brandon",
      "Eddard",
      "Tyrion",
      "Cersei",
      "Margaery",
      "Daenerys",
      "Viserys",
      "Jamie",
      "Petyr",
      "Jorah",
      "Stark",
      "Snow",
      "Rivers",
      "Tywin",
      "Davos",
      "Theon",
      "Robb",
      "Joffrey",
      "Khaleesi",
      "Samwell",
      "Sandor",
      "Gregor",
      "Stannis",
      "Melisandre",
      "Shae",
      "Bronn",
      "Varys",
      "Robert",
      "Drogo",
      "Lysa",
      "Robin",
      "Renly",
      "Brienne",
      "Selyse",
      "Lyanna",
      "Balon",
      "Kevan",
      "Lancel",
      "Podrick",
      "Roose",
      "Jory",
      "Meera",
      "Ramsay",
      "Jojen",
      "Brynden",
      "Tully",
      "Edmure",
      "Loras",
      "Benjen",
      "Aemon",
      "Illyrio",
      "Missandei",
      "Gendry",
      "Syrio",
      "Myrcella",
      "Tommen",
      "Aerys",
      "Rhaenys",
      "Osha",
      "Asha",
      "Ygritte",
      "Mycah",
      "Rhaegar",
      "Arryn",
      "Aeron",
      "Arianne",
      "Doran",
      "Quentyn",
      "Nymeria",
      "Jeyne",
      "Jane",
      "Walder",
      "Hoster",
      "Willas",
      "Mace"
    ];
    var rnum = Math.floor(Math.random() * names.length);
    return names[rnum];
  },
  randomGOTipsumSentenceGenerator() {
    var sentences = [
      "Spare me your false courtesy, moon and stars, weirwood bastard eiusmod tempor incididunt ut labore et you know nothing.",
      "Ut betrothed righteous in wrath, none so fierce green dreams suckling pig let me soar commodo consequat.",
      "Duis nuncle irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
      "Excepteur sint occaecat cupidatat non proident, sunt in culpa take the black none so dutiful seven hells.",
      "Tread lightly here lacus.",
      "The wall trencher a odio.",
      "Godswood sandsilk, coin rouse me not, night's watch bibendum feast, nec luctus magna felis sollicitudin lance.",
      "Mare's milk mauris eu nibh euismod gravida.",
      "Duis ac tellus et moon-flower juice sword.",
      "Dagger never resting ever vigilant.",
      "Maidenhead throne.",
      "Ut ullamcorper, your grace tempor congue, bannerman est euismod turpis, arbor gold sapien risus honeyed locusts.",
      "Maecenas fermentum royal mi.",
      "Bloody mummers.",
      "Old bear work her will.",
      "Lamprey sapien sem, the seven, whore destrier, night's watch, dirk.",
      "Suckling pig, holdfast lord of light, as high as honor, mare's milk diam lacus eget erat.",
      "Cras winter is coming.",
      "Spiced wine.",
      "Sorcery consequat.",
      "Full of terrors, seven hells, green dreams, pretium ac, motley.",
      "Arbor gold feast, sister dwarf, moon-flower juice, honeyed locusts, orci.",
      "In garrison habitasse platea dictumst.",
      "Fusce bannerman, a taste of glory, nisl turpis suscipit mauris, no foe may pass sed neeps.",
      "Honed and ready merchant mauris.",
      "Curabitur non elit ut libero tristique stag.",
      "Moon and stars.",
      "Donec mattis never resting.",
      "In hac habitasse ice fool.",
      "Vivamus facilisis diam at prince.",
      "Mauris dictum, mulled wine night's watch, dungeon ligula molestie metus, beware our sting magna baseborn sem.",
      "Fleet turpis.",
      "You know nothing.",
      "Morbi tristique neque eu mauris.",
      "Suckling pig ipsum the wall.",
      "Proin turpis lacus, scelerisque vitae, blood others, spearwife crypt, quam.",
      "Aliquam take the black.",
      "Ever vigilant habitasse platea dictumst.",
      "Maegi sit amet garron.",
      "Seven hells.",
      "Bloody mummers.",
      "In semper bibendum libero.",
      "Proin dog, we do not sow, mare's milk spiced wine, vitae tristique magna lacus sit warrior eros.",
      "Death gallant.",
      "Praesent odio ligula, dwarf coin, green dreams, gown raiders, nibh.",
      "Arbor gold lacus.",
      "Nunc eleifend molestie sandsilk.",
      "Tunic none so fierce velit.",
      "Warg euismod vestibulum massa.",
      "Stag honeyed locusts.",
      "Always pays his debts never resting.",
      "Let it be written weirwood.",
      "Nullam non diam.",
      "Pellentesque habitant morbi milk of the poppy et malesuada fames ac suckling pig.",
      "In hac none so wise.",
      "Aenean vestibulum.",
      "Ours is the fury lectus.",
      "Old bear poison is a woman's weapon.",
      "Aliquam vehicula sem ut feast.",
      "Cras purus lectus, egestas eu, your grace, spiced wine, blood.",
      "Fire death before disgrace.",
      "Donec vitae nisi.",
      "Mulled wine feugiat elit.",
      "Drink, your king commands it ullamcorper feugiat.",
      "Praesent pretium, we light the way, clansmen lorem iaculis magna, pulvinar scelerisque seven hells a justo.",
      "Bloody mummers rouse me not.",
      "Wench quis quam.",
      "Night's watch.",
      "Curabitur ac sapien.",
      "Nam erat.",
      "Praesent ut dog.",
      "Vivamus steel, augue et laoreet euismod, mare's milk the wall, the last of the dragons ice.",
      "Betrothed vestibulum tortor ac lacus.",
      "None so dutiful throne.",
      "Arbor gold motley justo.",
      "Honeyed locusts.",
      "Integer m'lord though all men do despise us.",
      "Full of terrors.",
      "Never resting.",
      "Let me soar, the seven, m'lady dragons, tempor sed, urna.",
      "Winter is coming, your grace, ever vigilant, moon-flower juice, lacus.",
      "Dwarf viverra purus.",
      "Quisque elit.",
      "Lord of light.",
      "Duis volutpat elit et erat.",
      "In lamprey craven no song so sweet.",
      "Quisque elementum pharetra lacus.",
      "Mulled wine beware our sting.",
      "Nulla iaculis egestas magna.",
      "Dungeon erat volutpat.",
      "Work her will.",
      "You know nothing, crypt sit amet, pharetra tunic, imperdiet sit amet, brothel.",
      "Our sun shines bright mi aliquam pretium.",
      "Nullam mauris orci, green dreams, snow non, vulputate id, throne.",
      "He asked too many questions.",
      "Nam aliquam lacinia enim.",
      "Warg eget lorem eu purus dignissim maester.",
      "Seven hells night's watch.",
      "Mauris urna diam, spiced wine, dagger dragons, take the black, clansmen.",
      "None so fierce.",
      "Death before disgrace.",
      "Honed and ready, bloody mummers, spiced wine, arbor gold, leo.",
      "None so dutiful, fire id, maidenhead ut, old bear, odio.",
      "Steel raiders.",
      "Vestibulum auctor tortor never resting.",
      "Integer semper, as high as honor, erat nisl hendrerit justo, eget righteous in wrath sandsilk leo.",
      "Integer fleet velit, pharetra in, suckling pig, honeyed locusts, felis.",
      "Vestibulum sed felis.",
      "In maegi.",
      "As high as honor let me soar.",
      "Donec magna.",
      "Quisque id risus.",
      "No foe may pass.",
      "Duis crypt, motley pride and purpose, orci nunc interdum leo, ac egestas elit sem ut lacus.",
      "We do not sow king moon-flower juice.",
      "Always pays his debts mare's milk sun.",
      "Moon and stars.",
      "Pellentesque vitae tellus.",
      "Fusce lectus est, accumsan sword, seven hells, crimson eget, augue.",
      "Ever vigilant.",
      "Rouse me not eu ante.",
      "Brother coin nisl, ornare auctor, mulled wine, posuere tristique, moon.",
      "In his cups ironborn.",
      "Ut green dreams, spiced wine, merchant maester, tristique eget, slave.",
      "Pellentesque habitant morbi tristique no foe may pass feed it to the goats.",
      "None so wise, condimentum id, scelerisque ac, the seven, lamprey.",
      "Arbor gold ligula ac sapien suscipit blandit.",
      "Suspendisse euismod.",
      "Ut accumsan, usurper bloody mummers wildling, arcu pede nightsoil manhood, goblet blandit massa arcu eget ligula.",
      "Winter is coming.",
      "Feed it to the goats nuncle beware our sting your grace never resting.",
      "Donec sem crimson, moon-flower juice, commodo eu, tempor nec, crows.",
      "Donec laoreet ice cloak.",
      "Servant seven hells, bibendum dwarf, ornare et, old bear, realm.",
      "Milk of the poppy.",
      "Gallant ante ipsum no foe may pass though all men do despise us treachery honeyed locusts bannerman.",
      "Ours is the fury.",
      "Suspendisse et orci et arcu suckling pig.",
      "Motley green dreams, your grace, mulled wine, imperdiet eget, flagon.",
      "Nam consectetuer euismod nunc.",
      "Nulla dignissim arbor gold.",
      "Ever vigilant night's watch.",
      "Nullam sapien augue, condimentum vel, venenatis id, coopers pellentesque, sapien.",
      "None so fierce ultrices turpis consectetuer imperdiet.",
      "We light the way maester throne wolf.",
      "Mauris eu est.",
      "Tread lightly here a taste of glory.",
      "Donec tellus mi, luctus sit amet, ultrices a, convallis eu, holdfast.",
      "Proin faucibus convallis elit.",
      "Full of terrors spiced wine.",
      "Joust whore.",
      "Moon-flower juice.",
      "Mace spare me your false courtesy pretium.",
      "Maid old bear, spiced wine, iaculis ut, elementum non, turpis.",
      "The wall.",
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit, though all men do despise us honeyed locusts dolore magna aliqua.",
      "You know nothing minim veniam, spare me your false courtesy nisi ut aliquip ex seven hells dog.",
      "Ice spider no foe may pass suckling pig velit esse let it be written nulla pariatur.",
      "As high as honor brother greyscale, work her will qui smallfolk we do not sow green dreams.",
      "Curabitur pretium tincidunt lacus.",
      "Pride and purpose a cell.",
      "Nullam moon, always pays his debts, est bloody mummers bannerman, mare's milk m'lady felis sollicitudin mauris.",
      "Integer in mauris our sun shines bright.",
      "Spiced wine moon-flower juice risus vulputate vehicula.",
      "Night's watch never resting realm.",
      "Merchant lamprey.",
      "Ever vigilant, steel moon and stars, maester est euismod turpis, id tincidunt sapien the seven quam.",
      "Always pays his debts.",
      "Donec fermentum.",
      "Pellentesque betrothed bastard the wall.",
      "Duis sapien sem, honeyed locusts, commodo eget, consequat quis, baseborn.",
      "Aliquam faucibus, elit ut greyscale dwarf, felis nisl adipiscing sapien, sed malesuada diam lacus eget erat.",
      "Old bear mulled wine.",
      "Moleskin blood.",
      "Bloody mummers.",
      "Curabitur augue lorem, dapibus quis, mare's milk, moon-flower juice, nisi.",
      "Seven hells chamber, mollis squire, spiced wine, your grace, orci.",
      "Suckling pig habitasse platea dictumst.",
      "Fusce convallis, the seven gravida bibendum, garrison turpis suscipit mauris, sed placerat ipsum urna sed prince.",
      "Milk of the poppy tunic.",
      "Death before disgrace ut libero tristique sodales.",
      "Lord of light.",
      "Donec mattis your grace.",
      "None so dutiful trueborn beast.",
      "Beware our sting at odio.",
      "Old bear, none so wise darkness, lacus ligula molestie maester, winter is coming let me soar.",
      "Donec turpis.",
      "In his cups.",
      "Morbi tristique neque nightsoil servant.",
      "Rouse me not never resting.",
      "Tread lightly here, scelerisque vitae, elementum at, gallant ac, fleet.",
      "No foe may pass.",
      "Honeyed locusts sellsword platea dictumst.",
      "Righteous in wrath ser.",
      "Suspendisse odio.",
      "Blood brothel.",
      "In semper arbor gold.",
      "Mare's milk, moon-flower juice pulvinar magister, pede felis dignissim leo, the wall poison is a woman's weapon.",
      "Nullam ornare.Praesent odio ligula, green dreams, spiced wine, dictum ac, nibh.",
      "Mulled wine death.",
      "Nunc eleifend molestie velit.",
      "Morbi lobortis quam eu velit.",
      "Take the black massa.",
      "Donec non lectus.",
      "Aliquam commodo lacus ever vigilant nulla.",
      "Cras you know nothing augue.",
      "Nullam suckling pig.",
      "Slay no foe may pass et netus et baseborn fames ac turpis egestas.",
      "We light the way dictumst.",
      "Never resting.",
      "Sed lobortis elit quis m'lady.",
      "Seven hells honeyed locusts full of terrors.",
      "Work her will ut pede.",
      "Gallant beast arakh, your grace, mare's milk, imperdiet sed, whore.",
      "Morbi consectetuer luctus felis.",
      "Night's watch spider.",
      "Moon and stars elit.",
      "Duis sed none so dutiful ullamcorper feugiat.",
      "The wall, wildling sed fermentum hendrerit, nulla lorem iaculis sister, pulvinar scelerisque urna tellus a joust.",
      "The seven massa in slave.",
      "Duis quis quam.",
      "Proin justo.",
      "Curabitur old bear.",
      "Spiced wine.",
      "Lord of light.",
      "Brothel gown, maidenhead et laoreet throne, suckling pig bloody mummers, ac egestas sem ligula quis steel.",
      "Donec vestibulum tortor ac lacus.",
      "Sed posuere vestibulum nisl.",
      "Mulled wine honeyed locusts.",
      "Seven hells.",
      "Ironborn your grace the last of the dragons.",
      "None so fierce.",
      "Realm facilisi.",
      "Arbor gold moon, scelerisque et, spiced wine, crimson ward, cloak.",
      "Vivamus craven beast, gargoyles betrothed, mare's milk, never resting, lacus.",
      "In his cups.",
      "Quisque neeps.",
      "Pride and purpose.",
      "Old bear honed and ready.",
      "In at nulla at nisl green dreams.",
      "Quisque elementum pharetra lacus.",
      "No foe may pass nunc.",
      "Nulla iaculis egestas magna.",
      "Godswood ever vigilant.",
      "Rouse me not.",
      "Take the black, iaculis sit amet, pharetra quis, bloody mummers amet, lectus.",
      "Steel let it be written night's watch.",
      "Nullam mauris orci, mulled wine, suckling pig, vulputate id, court.",
      "Donec varius full of terrors.",
      "Nam aliquam lacinia royal.",
      "Quisque eget ser crypt purus coin ultricies.",
      "Sellsword porttitor hendrerit ante.",
      "None so wise, cursus id, the wall, spiced wine amet, motley.",
      "Your grace felis.",
      "Pavilion eu mi.",
      "Moon-flower juice fool, luctus a, mattis ac, tempus non, leo.",
      "Let me soar, rhoncus slay, laoreet ut, ultricies id, odio.",
      "Fire maidenhead.",
      "Never resting righteous in wrath.",
      "Integer semper, nisi eget suscipit steel, the seven hendrerit nightsoil, eget vestibulum lorem justo ac leo.",
      "Old bear m'lady, honeyed locusts, fringilla king, ever vigilant, clansmen.",
      "Baseborn mulled wine.",
      "Arbor gold.",
      "Praesent et pede vel ante dapibus death.",
      "Donec magna.",
      "Suckling pig risus.",
      "Mauris the wall spearwife.",
      "Night's watch, as high as honor, ours is the fury, we do not sow gown stag.",
      "Your grace diam quis arcu manhood smallfolk.",
      "Curabitur nec massa ac tread lightly here.",
      "Aenean id libero.",
      "None so fierce.",
      "Fusce flagon est, accumsan ac, seven hells, warg steel, augue.",
      "Bloody mummers.",
      "Quisque death before disgrace maester.",
      "Cloak sapien garrison, old bear, moleskin trueborn, posuere tristique, arakh.",
      "No song so sweet.",
      "Ut augue nulla, honeyed locusts, spiced wine, green dreams, neque.",
      "Our sun shines bright senectus et netus et malesuada fames ac turpis egestas.",
      "Never resting warrior, condimentum id, scelerisque ac, arbor gold, quam.",
      "Lord of light a taste of glory.",
      "Suspendisse greyscale.",
      "The seven, neque lance night's watch, milk of the poppy, always pays his debts moon-flower juice.",
      "Aenean sed turpis.",
      "We light the way senectus et netus et malesuada dirk sorcery turpis egestas.",
      "Honed and ready, raiders ut, mace eu, your grace, risus.",
      "Garron dog dapibus ligula.",
      "Sellsword mulled wine, bibendum nec, ornare et, nonummy in, elit.",
      "No foe may pass.",
      "Vestibulum brothel you know nothing let it be written ultrices posuere mare's milk in his cups destrier.",
      "Donec convallis tincidunt urna."
    ];
    var rnum = Math.floor(Math.random() * sentences.length);
    return sentences[rnum];
  },
  random_chat_messager(){
    $("#inputChat").val(AutoTester.randomGOTipsumSentenceGenerator());
    doSendChatMessage();
    setTimeout(function() {
      AutoTester.random_chat_messager()
    }, Math.floor(Math.random() * 300000));
  },
  card_flipping(){
    // this functionality is not used.
    $( ".cardFaces" ).each(function(index) {
      $(this).on("click", function(){
        $(this).toggleClass('flipped');
      });
    });
  },
  start(){
 
    delayMilli = 500;
    setTimeout(function() { // create username
      myLogger.line("TEST","red","Auto Test Started.")
    }, delayMilli);
    delayMilli += Math.random() * 10000 * Math.random();
    setTimeout(function() { // create username
      $("#inputUsername").val(AutoTester.randomGOTusernameGenerator());
    }, delayMilli);
    delayMilli += 1000;
    setTimeout(function() { // Send a login request
      myLogger.line("TEST","red","Login attempt.")
      doSendLoginReguest();
    }, delayMilli);
    delayMilli += Math.floor(Math.random() * 8000);
    setTimeout(function() { // Send a seat request
      if ($("#mySeatButton").prop('disabled')){myLogger.line("TEST","red","Seat 1 taken by " + $("#mySeatButton").val()+".");
        if ($("#nextSeatButton").prop('disabled')){myLogger.line("TEST","red","Seat 2 taken by " + $("#nextSeatButton").val()+".");
          if ($("#partnerSeatButton").prop('disabled')){myLogger.line("TEST","red","Seat 3 taken by " + $("partnerSeatButton").val() + ".");
            if ($("#previousSeatButton").prop('disabled')){myLogger.line("TEST","red","All seats taken.");
            }else{doSendSeatRequest(4);}
          }else{doSendSeatRequest(3);}
        }else{doSendSeatRequest(2);}
      }else{doSendSeatRequest(1);}
    }, delayMilli);

    /*
    delayMilli += 4000;
    setTimeout(function() { // Test Chat Gritter
      myLogger.line("TEST","red","Chat display.")
      onIncomingChatMessage("Test User", "Test Chat Message.");
    }, delayMilli);
    delayMilli += 500;
    setTimeout(function() { // Test Notification Gritter (remove after 2sec)
      myLogger.line("TEST","red","Notification display.")
      var Notification = onIncomingNotification("Test Notification.");
      setTimeout(function() {
        $.gritter.remove(Notification);
      }, 2000);
    }, delayMilli);
    delayMilli += 500;
    setTimeout(function() { // Test Alert Gritter (remove after 2sec)
      myLogger.line("TEST","red","Alert display.")
      var Alert = onIncomingAlert("Test Alert.");
      setTimeout(function() {
        $.gritter.remove(Alert);
      }, 2000);
    }, delayMilli);
    delayMilli += 500;
    setTimeout(function() { // Test Error Gritter (remove after 2sec)
      myLogger.line("TEST","red","Error display.")
      var Error = onIncomingError("Test Error.");
      setTimeout(function() {
        $.gritter.remove(Error);
      }, 2000);
    }, delayMilli);
    delayMilli += 1000;
    
    setTimeout(function() { // Start Random Chats Outputs
      myLogger.line("TEST","red","Random chats started.")
      AutoTester.random_chat_messager();
    }, delayMilli);
    */
/*
    cardNumber = 1;
    setTimeout(function() {
      myLogger.line("TEST","red","Showing some cards.")
    }, delayMilli);
    for (i = 0; i < 15; i++){ // display nexthand
      if (i < 14){
        setTimeout(function() {
          doDisplayCardBack("#nextHand #card_"+cardNumber);
          cardNumber++;
        }, delayMilli);
      }
      else{
        setTimeout(function() {
          cardNumber = 1;
        }, delayMilli);
      }
      delayMilli += 50;
    }
    for (i = 0; i < 15; i++){ // display partnerhand
      if (i < 14){
        setTimeout(function() {
          doDisplayCardBack("#partnerHand #card_"+cardNumber);
          cardNumber++;
        }, delayMilli);
      }
      else{
        setTimeout(function() {
          cardNumber = 1;
        }, delayMilli);
      }
      delayMilli += 50;
    }
    for (i = 0; i < 15; i++){ // display previoushand
      if (i < 14){
        setTimeout(function() {
          doDisplayCardBack("#previousHand #card_"+cardNumber);
          cardNumber++;
        }, delayMilli);
      }
      else{
        setTimeout(function() {
          cardNumber = 1;
        }, delayMilli);
      }
      delayMilli += 50;
    }
    */

  }
}
