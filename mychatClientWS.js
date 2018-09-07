/* 
   here is websocket implementation
   for Client, so we don't need any 
   WSCAT packages to test our program
*/

var WebSocket = require('ws');
var ws = new WebSocket('ws://localhost:1551');

console.log("Welcome to Anoush's chat. Feel free. Type something");
process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(message) {
  message = message.trim();
  ws.send(message, console.log.bind(null,'Sent: ', message));
})

ws.on('message', function(message) {
  console.log('Recieved: ' + message);
});

ws.on('close', function(code) {
  console.log('Disconnected: ' + code);
});

ws.on('error', function(error) {
  console.log('Error: ' + error.code);
});
