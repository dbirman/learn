var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get( '/*' , function( req, res ) {
    // this is the current file they have requested
    var file = req.params[0]; 
    // console.log('\t :: Express :: file requested: ' + file);    

    // give them what they want
    res.sendfile("./" + file);
}); 

io.on('connection', function(socket){
  console.log('Connection: ID ' + socket.id);

  socket.on('disconnect', function(){
  	console.log('disconnect');
  });

  socket.on('settings', function() {
    io.to(socket.id).emit('settings',settings);
  })

  socket.on('request', function(req) {
  	console.log('Request made');
  	console.log('Stimulus: ' + req.stim); // one of dot, 
  	console.log('Area: ' + req.area);
  	console.log('X: ' + req.x);
  	console.log('Y: ' + req.y);
  	// request also includes sizeX and sizeY which are the rectangular area
  	// try {
  		reqRespond(socket.id,req);
  	// } catch (e) {

  	// }
  })
});

// Note that data sizes is 2601 * 51 * 51

function reqRespond(id,req) {
	var datapack = req;
	// this is the ELECTRODE position: turn it into an index
	var idx = 2601*(req.x*51+req.y)+1; // in 1:2601 space
	datapack.idx = [idx,idx+2601];
	datapack.data = data[req.stim][req.area].slice(idx,idx+2601);

	io.to(id).emit('data',datapack);
  console.log('Request complete');
}

var data = {};
var load = require('./data/data.js');
var settings = require('./data/settings.json');

var port = 8080;
http.listen(port, function(){
  console.log('listening on *: ' + port);
  var lkeys = Object.keys(load);
  for (var i=0;i<lkeys.length;i++) {
    console.log('Found stimulus: ' + load[lkeys[i]].stim);
    console.log('Found region data for: ' + load[lkeys[i]].area);
    if (data[load[lkeys[i]].stim]==undefined) {data[load[lkeys[i]].stim]={};}
    data[load[lkeys[i]].stim][load[lkeys[i]].area] = load[lkeys[i]].data;
  }
  load = {};
});