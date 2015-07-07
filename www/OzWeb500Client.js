
/* SETTINGS */
client_version = 0.1
WebSocket_Add = window.location.hostname
WebSocket_Port = "8000"
autoTest = true;

/* CARD RELATED CONSTANTS */
/// SUIT index ranges from 1 to 5.
SUIT_str  = [null,"Clubs","Spades","Diamonds","Hearts","No Trumps"]
SUIT_disp = [null,"♣","♠","♦","♥",""]
SUIT_col  = [null,"black","black","red","red",""]
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
  $(card + "> face#front #rank").text(RANK_disp[rank]);
  $(card + "> face#front #suit").text(SUIT_disp[suit]);
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
// Layout Adjustment Doers
function doLayoutVerticalCentre() {
  $('#table_cards').css({
    position: 'absolute',
    left: ($(window).width() - $('#table_cards').outerWidth()) / 2,
    top: ($(window).height() - $('#table_cards').outerHeight()) / 2 - 40
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
