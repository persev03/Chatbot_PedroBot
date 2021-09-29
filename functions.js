const main = require('./bot.js');
const request = require('request');

//////////////////////////////////////////////////////////////////////////////
//
//   Funciones personalizadas
// 
//////////////////////////////////////////////////////////////////////////////

function givemeYourLocation(recipientId){
  var messageData = {
    recipient: {id: recipientId},
    message: { text:"Dame tu ubicacion porfis",
              quick_replies:[{content_type:'location', payload:"USER_LOCATION"}]}
      };
  
  main.callSendAPI(messageData);
}


////////////////////////////////
// Mensaje de bienvenida.
// Saluda al usuario y dispara  el proceso de compra al 
// presionar el boton 'QUIERO PEDIR' con payload="USER_STARTS"
////////////////////////////

function getUserInfo(userId){
  console.log(main.user_name == null);
  request({
      uri: 'https://graph.facebook.com/v2.6/'+ userId +'?fields=first_name,last_name,profile_pic,locale,timezone,gender',
      method: 'GET',
      qs: { access_token: process.env.PAGE_ACCESS_TOKEN }
    }, function (error, response, body) {
      
    if (!error && response.statusCode == 200) {
      var userJSON = JSON.parse(body);  
      console.log("User Info ", userJSON);
      var user_first_name = userJSON.first_name;
      main.user_name = user_first_name;
      var messageText = 'Hola '+ main.user_name + '! \nSoy Pedro y puedo ofrecerte pan recién horneado en tu oficina.';
      main.sendButtonMessage(userId, messageText, "Quiero pedir", "USER_STARTS");
    } else {
      console.error(userId, 'Unable to get User Data.');
      console.error(response);
      console.error(error);
      }
    });   
}


////////////////////////////////
// EL usuario escoge el combo que quiere pedir.
// payload="COMBO_PAN_FRANCES" o "COMBO_PAN_ROLLITO"
////////////////////////////
function chooseYourCombo(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "Francés",
            subtitle: "10 unidades de pan Francés.\n$4500.\nSe entrega entre 8:30am y 9:20am",
            item_url: "",               
            image_url: "https://pedrotienda.com/pub/media/logo/frances.jpg",
            buttons: [{
              type: "postback",
              title: "Quiero este combo!",
              payload: "COMBO_PAN_FRANCES",
            },],
          }, {
            title: "Rollito",
            subtitle:"10 unidades de pan Rollito.\n$4500.\nSe entrega entre 9:30am y 10:30am",
            item_url:"",               
            image_url: "https://pedrotienda.com/pub/media/logo/rollito.jpg",
            buttons: [{
              type: "postback",
              title: "Quiero este combo!",
              payload: "COMBO_PAN_ROLLITO",
            },]
          }]
        }
      }
    }
  };  

  main.callSendAPI(messageData);
}


/////////////////////////////////////////////
// Una vez el usuario ha elegido el combo
// elige la cantidad de combos
/////////////////////////////////////////////

function chooseQuantity(recipientId){
  console.log("Pidiendo cantidad de combos");
  var messageData = {
                      "recipient":{
                      "id":recipientId
                    },
                    "message":{
                      "text":"Cuántos combos quieres ordenar?",
                      "quick_replies":[
                        {"content_type":"text",
                          "title":"1",
                          "payload":"QT_1"
                        },{
                          "content_type":"text",
                          "title":"2",
                          "payload":"QT_2"
                        },{
                          "content_type":"text",
                          "title":"3",
                          "payload":"QT_3"
                        },{
                          "content_type":"text",
                          "title":"4",
                          "payload":"QT_4"
                        },{
                          "content_type":"text",
                          "title":"5",
                          "payload":"QT_5"
                        }
                      ]
                    }
                  }
  main.callSendAPI(messageData);
}

////////////////////////////////////////////////
// Mostrar la orden de compra
////////////////////////////////////////////////

function showOrder(recipientId) {
  console.log("Mostrar orden de pedido");
  var messageText = 'Listo!\nEsta es tu orden de compra:\n'+ main.user_name +'\n';
  messageText += 'COMBO '+ main.user_combo +'\n   x '+ main.user_combo_quantity;
  
  main.sendButtonMessage(recipientId, messageText, "Pedir", "USER_ORDERED");
}


