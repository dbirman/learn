var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var jsonfile = require('jsonfile');

app.get( '/*' , function( req, res ) {
    // this is the current file they have requested
    var file = req.params[0]; 
    // console.log('\t :: Express :: file requested: ' + file);    

    // give them what they want
    res.sendfile("./" + file);
}); 

var connectionList = {};

io.on('connection', function(socket){
  console.log('Connection: ID ' + socket.id);
  addClient(socket.id);

  socket.on('disconnect', function(data){
    console.log('received data from' + socket.id);
    saveData(socket.id,data);
  });

  socket.on('disconnect', function(){
  	console.log('disconnect');
  });

});

function addClient(id) {
  connectionList[id] = {};
  connectionList[id].connected = Date.now();
}

function saveData(id,data) {
  connectionList[id].data = data;
}

function saveAllData() {
  var file = './data.json';
  jsonfile.writeFile(file,connectionList, function (err) {
    console.error(err);
  });

  setTimeout(saveAllData,60000);
}

saveAllData();