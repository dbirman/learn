var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

var IDs = 0;

io.on('connection', function(socket){
  console.log('Connection: ID ' + socket.id);

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  socket.on('request', function(msg){
  	var trees = ['A','B','C'];
    console.log(socket.id + ' requested tree: ' + trees[Number(msg)-1]);
    trackEmit[socket.id] = Number(msg);
  });
});

var trackEmit = {};

var A = 2;
var B = 2;
var C = 2;

function run() {
	rA = Math.random(); rB = Math.random(); rC = Math.random();
	if (rA<0.1) {A++;} else if (rA<0.2) {A--;}
	if (rB<0.1) {B++;} else if (rB<0.2) {B--;}
	if (rC<0.1) {C++;} else if (rC<0.2) {C--;}

	for (var id in trackEmit) {
		console.log(trackEmit[id]);
		if (trackEmit[id]==1) {
			io.to(id).emit('treeA',A);
			console.log('Sending A to ' + id);
		}
		else if (trackEmit[id]==2) {
			io.to(id).emit('treeB',B);
		}
		else if (trackEmit[id]==3) {
			io.to(id).emit('treeC',C);
		}
	}
	trackEmit = {};

	setTimeout(run,3000);
}

http.listen(3000, function(){
  console.log('listening on *:3000');
  run();
});


//// REQUESTS ////
// Client side:
// 'request' 1/2/3, which tree for next ping

// Server side:
// 'response' 0->5, amount each tree returns on this ping 