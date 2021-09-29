//
// This is main file containing codeme implementing the Express server and functionality for the Express echo bot.
//
'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const path = require('path');

const mySQLhandler = require('./mySQLhandler.js');

var messengerButton = "<html><head><title>PedroBot</title></head><body><h1>PedroBot</h1>"
messengerButton += "Pan recién horneado a domicilio! <div class=\"glitchButton\" "
messengerButton += " style=\"position:fixed;top:20px;right:20px;\"></div></body></html>";

// Para anadir paquetes adicionales
var mysql      = require('mysql');
var wildcard = require('wildcard');

var user_name;
var user_address;
var user_combo;
var user_combo_quantity;


// The rest of the code implements the routes for our Express server.
let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// Webhook validation
app.get('/webhook', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === process.env.VERIFY_TOKEN) {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);          
  }
});

// Display the web page
app.get('/', function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write(messengerButton);
  res.end();
});


// Message processing
app.post('/webhook', function (req, res) {
  console.log(req.body);
  var data = req.body;

  // Make sure this is a page subscription
  if (data.object === 'page') {
    
    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function(entry) {
      var pageID = entry.id;
      var timeOfEvent = entry.time;

      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        if (event.message) {
          receivedMessage(event);
        } else if (event.postback) {
          receivedPostback(event);   
        } else {
          console.log("Webhook received unknown event: ", event);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know
    // you've successfully received the callback. Otherwise, the request
    // will time out and we will keep trying to resend.
    res.sendStatus(200);
  }
});

// Incoming events handling
function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;
   
  
  console.log("Received message for user %d and page %d at %d with message:", 
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var messageId = message.mid;

  var messageText = message.text;
  var messageAttachments = message.attachments;

  if (messageText) {
    // If we receive a text message, check to see if it matches a keyword
    // and send back the template example. Otherwise, just echo the text we received.
    switch (messageText) {

      // Mensaje de Bienvenida. Almacena temporalmente el nombre
      // Desde esta función pregunta el combo que quiere pedir el cliente.  
      case 'holi':case 'holis':case 'olis': case 'Olis':case 'Holis': case'ola': case'Ola':case 'buenos dias': 
      case 'Buenos días': case 'buenos días': case 'buenas tardes':case 'Buenas Tardes': case 'buenas': case 'buenas!':
      case 'buenas!!':case 'Buenas':case 'Buenas!':case 'Buenas!!': case 'Buenas!!!': case 'Hola Don Pedro': 
      case 'hola don pedro': case 'hola don Pedro':case 'hey': case 'Hey': case 'Hi': case 'hi': 
      case 'alo': case 'Alo': case 'olas': case 'Olas': case 'Holas':
      case 'Hola': case 'hola': case 'holas': 
        getUserInfo(senderID);
        break;
        
      case 'google':
        askGoogle();
        break;
        
      case 'u':
        givemeYourLocation(senderID);
        break;
    
      case '1':
        user_combo_quantity = 1;
        showOrder(senderID);
        break;
        
      case '2':
        user_combo_quantity = 2;
        showOrder(senderID);
        break;
        
      case '3':
        user_combo_quantity = 3;
        showOrder(senderID);
        break;
        
      case '4':
        user_combo_quantity = 4;
        showOrder(senderID);
        break;
        
      case '5':
        user_combo_quantity = 5;
        showOrder(senderID);
        break;
        
      case 'Gracias': case 'gracias': case 'Gracias!': case 'gracias!': case 'Muchas gracias': case 'Muchas Gracias!': 
      case '¡Gracias!':
        sendTextMessage(senderID, "Es un gusto servirte!");
        break;
        
        
      case 'test':
        console.log('Iniciando conexion de prueba con mySQL pedrobot');
        mySQLhandler.mySQLtest();
        sendTextMessage(senderID, 'Revisa tu SQL ome!');
        break;
        
        
      //default:
        //sendTextMessage(senderID, messageText);
    }
  } else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachment received");
  }
}

function askGoogle() {
  var request = require('request');
  request('http://www.google.com', function (error, response, body) {
  console.log('error:', error); // Print the error if one occurred 
  console.log('statusCode:', response && response.statusCode); 
    // Print the response status code if a response was received 
  console.log('body:', body); // Print the HTML for the Google homepage. 
  });
  
}


function receivedPostback(event) {
  var senderID = event.sender.id;
  //getUserInfo(senderID);
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;

  // The 'payload' param is a developer-defined field which is set in a postback 
  // button for Structured Messages. 
  var payload = event.postback.payload;

  console.log("Received postback for user %d and page %d with payload '%s' " + 
    "at %d", senderID, recipientID, payload, timeOfPostback);

  // When a postback is called, we'll send a message back to the sender to 
  // let them know it was successful
  //sendTextMessage(senderID, payload );
  
  switch(payload){
    case 'USER_STARTS':
      chooseYourCombo(senderID);
      break;
      
    case 'COMBO_PAN_FRANCES':
      user_combo = 'FRANCES';
      chooseQuantity(senderID);
      break;
    case 'COMBO_PAN_ROLLITO':
      user_combo = 'ROLLITO';
      console.log( "Combo pan Rollito");
      chooseQuantity(senderID);
      break;

      
    case 'USER_ORDERED':
      sendTextMessage(senderID, '\n^___^\n\nGracias por tu compra!\nTe avisaremos cuando tu pedido salga del horno.');
      break;
      
    case 'QT_1':
      user_combo_quantity = 1;
      console.log("Un combo pedido");
      showOrder(senderID);
      break;
    case 'QT_2':
      user_combo_quantity = 2;
      showOrder(senderID);
      break;
    case 'QT_3':
      user_combo_quantity = 3;
      showOrder(senderID);
      break;
    case 'QT_4':
      user_combo_quantity = 4;
      showOrder(senderID);
      break;
    case 'QT_5':
      user_combo_quantity = 5;
      showOrder(senderID);
      break;

      }
}

////////////////////////////////////////////////////
// Interactua con la API de facebook.
//  Env'ia los mensajes (de todo tipo)
////////////////////////////////////////////////////
function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
    
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s", 
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });  
}

// Set Express to listen out for HTTP requests
var server = app.listen(process.env.PORT || 3000, function () {
  console.log("Listening on port %s", server.address().port);
});

//////////////////////////
// Sending helpers
//////////////////////////

function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);
}

function sendButtonMessage(recipientId, messageText, ButtonTitle, Payload) {
  var message = {
                  "recipient":{
                    "id":recipientId
                  },
                  "message":{
                    "attachment":{
                      "type":"template",
                      "payload":{
                        "template_type":"button",
                        "text":messageText,
                        "buttons":[
                          {
                            "type":"postback",
                            "title":ButtonTitle,
                            "payload":Payload
                          },
                        ]
                      }
                    }
                  }
                }
  callSendAPI(message);
}


module.exports.callSendAPI;
