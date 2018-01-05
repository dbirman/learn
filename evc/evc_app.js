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

  socket.on('request', function(req) {
  	console.log('Request made');
  	console.log('Stimulus: ' + req.stim); // one of dot, 
  	console.log('Area: ' + req.area);
  	console.log('X: ' + req.x);
  	console.log('Y: ' + req.y);
  	// request also includes sizeX and sizeY which are the rectangular area
  	try {
  		reqRespond(socket.id,req);
  	} catch (e) {

  	}
  })
});

// Note that data sizes is 2601 * 51 * 51

function reqRespond(id,req) {
	var datapack = req;
	// this is the ELECTRODE position: turn it into an index
	var idx = req.x*51+req.y+1;
	datapack.idx = [idx,idx+2601];
	datapack.data = data[req.stim][req.area].slice(idx,idx+2601);

	io.to(id).emit('data',datapack);
}

var data = require('./data/firing_rate.json');
var settings = require('./data/settings.json');

var port = 8080;
http.listen(port, function(){
  console.log('listening on *: ' + port);

  console.log(data.dot.retina.length);
});