/* client server chat
   tested with wscat 
 */


var wsPort = 1551; //port for ws server

var webSocketServer = require('websocket').server;
var http = require('http');

var history = [ ]; // for message history

var clients = [ ]; // for users history

function htmlEntities(str) {
  return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}


var colors = [ 'red', 'blue','green', 'purple', 'orange', 'pink']; //for each user a specific color

colors.sort(function(a,b) { return Math.random() > 100; } ); // for random order


var server = http.createServer(function(request, response) { });  // creating HTTP server

server.listen(wsPort, function() {
  console.log((new Date()) + " Server is listening on port " + wsPort);
});


var wsServer = new webSocketServer({                              //creates webSocketServer
  httpServer: server
});


wsServer.on('request', function(request) {
  console.log((new Date()) + ' Connection from origin '  + request.origin + '.');

  var connection = request.accept(null, request.origin);     //checking request.origin to see whether is connected to our server

  var index = clients.push(connection) - 1;                  //client index
  var userName = false;
  var userColor = false;
  console.log((new Date()) + ' Connection accepted.');

  if (history.length > 0) {                                 // sending back chat history
    connection.sendUTF(
        JSON.stringify({ type: 'history', data: history} ));
  }


  connection.on('message', function(message) {              //sending message
    if (message.type === 'utf8') {                          // accept only text

     if (userName === false) {                              // first message is username

        userName = htmlEntities(message.utf8Data);

        userColor = colors.shift();                         //getting random color
        connection.sendUTF(
            JSON.stringify({ type:'color', data: userColor }));
        console.log((new Date()) + ' User is known as: ' + userName
                    + ' with ' + userColor + ' color.');
      }  else {                                               //already known user
        console.log((new Date()) + ' Received Message from '
                    + userName + ': ' + message.utf8Data);


        var obj = {                                            // for history of all sent messages
          text: htmlEntities(message.utf8Data),
          sentBy: userName,
          color: userColor
        };
        history.push(obj);
        history = history.slice(-100);


        var json = JSON.stringify({ type:'message', data: obj });             //send message to all conected clients
        for (var i=0; i < clients.length; i++) {
          clients[i].sendUTF(json);
        }
      }
    }
  });


  connection.on('close', function(connection) {                               //disconnecting user
    if (userName !== false && userColor !== false) {
      console.log((new Date()) + " Peer "
          + connection.remoteAddress + " disconnected.");

      clients.splice(index, 1);                                                // remove user from the list of connected clients

      colors.push(userColor);                                                  // push back user's color to be reused by another user
    }
  });
});
