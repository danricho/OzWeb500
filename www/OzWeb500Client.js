
/* SETTINGS */
client_version = 0.1
WebSocket_Add = window.location.hostname
WebSocket_Port = "8000"
autoTest = true;

/* CARD RELATED CONSTANTS */
/// SUIT index ranges from 1 to 5.
SUIT_str  = [null,"Clubs","Spades","Diamonds","Hearts","No Trumps"]
SUIT_disp = [null,"♣","♠","♦","♥",""]
SUIT_col  = [null,"black","black","red","red","black"]
/// RANK index ranges from 3 to 15.
RANK_str  = [null,null,null,"3","4","5","6","7","8","9","10","Jack","Queen","King","Ace","Joker"]
RANK_disp = [null,null,null,"3","4","5","6","7","8","9","10","J","Q","K","A","Jok"]

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
  console.groupCollapsed("WS Sent: %s.", message.header);
  console.log("Sent Data:", message.data);
  console.groupEnd();
}
// Send Message Doers
function doSendLoginReguest() {
  var desired_username = $("#inputUsername").val();
  console.groupCollapsed("Attempting Login as '%s'.", desired_username);
  if (desired_username == "") {
    console.log("Username Empty: Setting Feedback.");
    doDisplayLoginFeedback("Enter a username!", true);
    console.groupEnd();
  } else if (desired_username.length < 3) {
    console.log("Username too short: Setting Feedback.");
    doDisplayLoginFeedback("Username is too short (min 3).", true);
    console.groupEnd();
  } else if (desired_username.length > 10) {
    console.log("Username too long: Setting Feedback.");
    doDisplayLoginFeedback("Username is too long (max 10).", true);
    console.groupEnd();
  } else {
    console.log("Sending usernameRequest message.");
    doDisplayLoginFeedback("Requesting username...", false);
    console.groupEnd();
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
  }else{
    $(card + "> face#front #rank").html(RANK_disp[rank]);
    $(card + "> face#front #suit").html(SUIT_disp[suit]);
  }

  $(card + "> face#back").fadeOut(50);
  $(card + "> face#front").fadeIn(50);
  $(card).fadeIn(50);
}
function doDisplayCardBack(card){
  $(card + "> face#front").removeClass("red").removeClass("black")
  $(card + "> face#front").fadeOut(50);
  $(card + "> face#back").fadeIn(50);
  $(card).fadeIn(50);
}
function doDisplayHideCard(card){
  $(card).fadeOut(50);
}
// Input Availability Doers
function doInputChatAvailable(state) {
  if (state) {
    $("#inputChat").prop('disabled', false);
  } else {
    $("#inputChat").prop('disabled', true);
  }
}
function doInputPlayerPositionAvailable(players){
  for (var i = 0; i < 4; i++){
    value = i+1
    if (players[i] === null) {
      null;
    }else{
      null;
    }
  }
  console.log("players",players);
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
  console.groupCollapsed("WS connection successfully opened.");
  console.log("Updating the connection status display to 'connected'.");
  doDisplayConnectionStatus(true);
  console.log("Open Event Data:", evt);
  console.groupEnd();
}
function onWebSockClose(evt) {
  console.groupCollapsed("WS connection closed.");
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
  console.groupEnd();

  setTimeout(function() {
    doWsConnect();
  }, 2500);

}
function onWebSockMessage(evt) {
  //console.log(evt.data)
  message = jQuery.parseJSON(evt.data);
  console.groupCollapsed("WS Rcvd: %s.", message.header);
  switch (message.header) {
    case "serverVersion":
      console.log("Updating the title version data to 'Server v" + message.data + " : Client v" + client_version + "'.");
      doDisplayVersionInfo(message.data, client_version)
      console.groupEnd();
      break;
    case "ping":
      console.log("Sending pong message.");
      console.groupEnd();
      doWsSend("pong", message.data);
      break;
    case "loginRequest":
      console.log("Showing the login modal.");
      doLayoutShowModal(true);
      console.groupEnd();
      break;
    case "usernameExists":
      console.log("Displaying login feedback (in red).");
      doDisplayLoginFeedback($("#inputUsername").val() + " is already logged in!", true);
      console.log("Clearing the entered username.");
      $("#inputUsername").val("");
      console.groupEnd();
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
      console.groupEnd();
      setTimeout(function() {
        doDisplayLoginFeedback("Login Successful.", false);
        doDisplayLoginStatus(username);
        doDisplayPageTitle(username);
        doInputChatAvailable(true);
      }, 1000);
      setTimeout(function() {
        doLayoutShowModal(false);
      }, 2500);
      break;
    case "userList":
      console.log("Updating user list.");
      doDisplayUserList(message.data);
      console.log("Received Data: ", message.data);
      console.groupEnd();
      break;
    case "chatMessage":
      console.log("From: " + message.data.fromUser + ".");
      console.log("Message: " + message.data.message + ".");
      console.log("Displaying message.");
      onIncomingChatMessage(message.data.fromUser, message.data.message);
      console.groupEnd();
      break;
    case "notification":
      console.log("Message: " + message.data.str + ".");
      console.log("Displaying notification.");
      onIncomingNotification(message.data.str);
      console.groupEnd();
      break;
    case "playerStatus":
      console.log("Updating the positions available on the login modal.");
      doInputPlayerPositionAvailable(message.data);
      console.groupEnd();
      break;
    default:
      console.log("Received Data: ", message.data);
      console.groupEnd();
  }

}
function onWebSockError(evt) {
  console.groupCollapsed("WS connection error.");
  console.log("Error Event Data:", evt);
  console.groupEnd();
}
// Incoming Message Reactions
function onIncomingChatMessage(frm, msg) {
  return $.gritter.add({
    title: frm + ":",
    text: msg,
    sticky: false,
    time: 4000,
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

  // Start the Fun
  doLayoutVerticalCentre();
  doWsConnect();
  if (autoTest){
    AutoTester.start();
  }

});

AutoTester = {
  delayMilli: 0,
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
  randomNameGenerator() {
    var names = [
      "Schmitt",
      "Woods",
      "Alvarado",
      "Horn",
      "Stokes",
      "Richards",
      "Baird",
      "Andersen",
      "Bryan",
      "Duncan",
      "Ho",
      "Arroyo",
      "Barnes",
      "Avery",
      "Burch",
      "Fry",
      "Cooke",
      "Mccoy",
      "Vega",
      "Cole",
      "Orr",
      "Valenzuela",
      "Newman",
      "Hanson",
      "Buckley",
      "Herring",
      "Hanna",
      "Boone",
      "Charles",
      "Barr",
      "Houston",
      "Hayes",
      "Black",
      "Floyd",
      "Berg",
      "Graves",
      "Prince",
      "Guzman",
      "Huerta",
      "Christensen",
      "Brady",
      "Booker",
      "Cervantes",
      "Johns",
      "Daniel",
      "Walton",
      "Donaldson",
      "Salas",
      "Bright",
      "Carrillo",
      "Kim",
      "Compton",
      "Pitts",
      "Hamilton",
      "Nolan",
      "Hooper",
      "Oneill",
      "Wright",
      "Cunningham",
      "Snyder",
      "Wilkins",
      "Chaney",
      "Stevenson",
      "Archer",
      "Rich",
      "Ibarra",
      "Thornton",
      "Delgado",
      "Velez",
      "Singh",
      "Giles",
      "Warner",
      "Schaefer",
      "Holden",
      "Buck",
      "Powell",
      "Cobb",
      "Erickson",
      "Chapman",
      "Hartman",
      "Benitez",
      "Fuller",
      "Davis",
      "Norman",
      "Mcgrath",
      "Esparza",
      "Baxter",
      "Sellers",
      "Pollard",
      "Ponce",
      "Bentley",
      "Clements",
      "Mcintosh",
      "Kaiser",
      "Brooks",
      "Castaneda",
      "Bond",
      "Nielsen",
      "Butler",
      "Cannon",
      "Spears",
      "Barton",
      "Mullen",
      "White",
      "Castro",
      "Villarreal",
      "Case",
      "Kirby",
      "Simmons",
      "Mccormick",
      "Foster",
      "Small",
      "Mathews",
      "Wells",
      "Fischer",
      "Parsons",
      "Francis",
      "Fletcher",
      "Pratt",
      "Watts",
      "Crawford",
      "Mcgee",
      "Luna",
      "Shaw",
      "Quinn",
      "Mathis",
      "Middleton",
      "Gilbert",
      "Salinas",
      "Andrade",
      "Phelps",
      "Burgess",
      "Cline",
      "Craig",
      "Goodwin",
      "Wise",
      "Cox",
      "George",
      "Lamb",
      "Jones",
      "Frye",
      "Harvey",
      "West",
      "Morton",
      "Lutz",
      "Zhang",
      "Cisneros",
      "Mccullough",
      "Kelly",
      "Fitzpatrick",
      "Carson",
      "Reyes",
      "Hicks",
      "Daniels",
      "Anthony",
      "Jefferson",
      "Li",
      "Bowen",
      "Barry",
      "Miller",
      "Glass",
      "Bray",
      "Norris",
      "Saunders",
      "Hinton",
      "Steele",
      "Moody",
      "Allison",
      "Malone",
      "Mack",
      "Hardy",
      "Pineda",
      "Page",
      "Duffy",
      "Anderson",
      "Sampson",
      "Mcmillan",
      "Lynn",
      "Pope",
      "Mullins",
      "Schwartz",
      "Reid",
      "Nash",
      "Bradshaw",
      "Moore",
      "Boyle",
      "Tran",
      "Swanson",
      "Tapia",
      "Salazar",
      "Sparks",
      "Rangel",
      "Donovan",
      "House",
      "Koch",
      "Spencer",
      "Tyler",
      "Perez",
      "Frank",
      "Robertson",
      "Khan",
      "Gilmore",
      "Greer",
      "Blackwell",
      "Harmon",
      "Randolph",
      "Mercado",
      "Whitney",
      "Gutierrez",
      "Dean",
      "Walsh",
      "Hendrix",
      "Holder",
      "Gibson",
      "Massey",
      "Coleman",
      "Morgan",
      "Marks",
      "Schultz",
      "Ashley",
      "Jacobs",
      "Bernard",
      "Hutchinson",
      "Richmond",
      "Potts",
      "Davies",
      "Dodson",
      "Clayton",
      "Gamble",
      "Booth",
      "Dougherty",
      "Ingram",
      "Watkins",
      "Figueroa",
      "Burke",
      "Camacho",
      "Oconnell",
      "Carey",
      "Gay",
      "Hines",
      "Marquez",
      "Graham",
      "Mcknight",
      "Pruitt",
      "Gray",
      "Adams",
      "Fuentes",
      "Richard",
      "Soto",
      "Tucker"
    ];
    var rnum = Math.floor(Math.random() * names.length);
    return names[rnum];
  },
  randomSentenceGenerator() {
    var sentences = [
      "A sound you heard is good for you.",
      "Insignificance is running away.",
      "A setback of the heart likes to have a shower in the morning.",
      "A fly is ever present.",
      "Trickery tells the tale of towers.",
      "Gasoline lay down on the riverbed.",
      "Colorful clay lies ahead, what with the future yet to come.",
      "The last sentence you saw tenderly sees to her child.",
      "Rock music will take you to places you never expected not to visit!",
      "Organisational culture stands upon somebody else's legs.",
      "A caring mother visits Japan in the winter.",
      "Tomorrow is always a pleasure.",
      "The person you were before loves a good joke!",
      "A small mercy sickens me.",
      "A great silence says goodbye to the shooter.",
      "Style brings both pleasure and pain.",
      "A classical composition shakes beliefs widely held.",
      "Camouflage paint is still not very coherent.",
      "The other side was always the second best.",
      "A token of gratitude is not yet ready to die.",
      "Sevenworm takes the world for granted.",
      "Sixty-four says hello.",
      "Nihilism bathes in sunlight.",
      "Gasoline shot the sheriff.",
      "Passion or serendipity stole the goods.",
      "Trickery is nonsensical, much like me.",
      "Stew and rum would kindly inquire something about you.",
      "A sickingly prodigous profile ever stuns the onlooker.",
      "The light at the end of the tunnel loves a good joke!",
      "A principal idea will take you to places you never expected not to visit!",
      "Another day does not make any sense."];
    var rnum = Math.floor(Math.random() * sentences.length);
    return sentences[rnum];
  },
  random_chat_messager(){
    $("#inputChat").val(AutoTester.randomSentenceGenerator());
    doSendChatMessage();
    setTimeout(function() {
      AutoTester.random_chat_messager()
    }, Math.floor(Math.random() * 120000));
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
    console.log("Auto Tester Started.")
    AutoTester.delayMilli += 500;
    setTimeout(function() { // Send a login request
      $("#inputUsername").val(AutoTester.randomNameGenerator());
      doSendLoginReguest();
    }, AutoTester.delayMilli);
    AutoTester.delayMilli += 4000;
    setTimeout(function() { // Test Chat Gritter
      onIncomingChatMessage("Test User", "Test Chat Message.");
    }, AutoTester.delayMilli);
    AutoTester.delayMilli += 1000;
    setTimeout(function() { // Test Notification Gritter (remove after 4sec)
      var Notification = onIncomingNotification("Test Notification.");
      setTimeout(function() {
        $.gritter.remove(Notification);
      }, 4000);
    }, AutoTester.delayMilli);
    AutoTester.delayMilli += 1000;
    setTimeout(function() { // Test Alert Gritter (remove after 4sec)
      var Alert = onIncomingAlert("Test Alert.");
      setTimeout(function() {
        $.gritter.remove(Alert);
      }, 4000);
    }, AutoTester.delayMilli);
    AutoTester.delayMilli += 1000;
    setTimeout(function() { // Test Error Gritter (remove after 4sec)
      var Error = onIncomingError("Test Error.");
      setTimeout(function() {
        $.gritter.remove(Error);
      }, 4000);
    }, AutoTester.delayMilli);
    AutoTester.delayMilli += 3000;
    setTimeout(function() { // Start Random Chats Outputs
      AutoTester.random_chat_messager();
    }, AutoTester.delayMilli);
  }
}
