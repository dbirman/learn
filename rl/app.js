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

var IDs = 0;

io.on('connection', function(socket){
  console.log('Connection: ID ' + socket.id);

  socket.on('disconnect', function(){
  	try {
	    console.log('user disconnected');
	    delete scores[socket.id];
	    delete section[socket.id];
	    delete talist[socket.id];
	    taDisconnect(socket.id);
  	} catch(err) {
  		console.log(err);
  	}
  });

  socket.on('login', function(msg){
  	try {
	  	// Message is student.section
	  	// or ta.section.password
	  	var res = msg.split('.');

	  	var success = false;

	  	var group = res[0];
	  	var sec = Number(res[1]);

	  	if (!isNaN(sec) && typeof(sec)=='number') {
		  	// start the login process
		  	console.log(socket.id + ': requesting login as ' + group);

		  	if (group=='student') {
		  		// add this student to the right section
		  		section[socket.id] = sec;

		  		io.to(socket.id).emit('status','connected.student');
		  		checkForest(sec); // check that this forest exists
		  		success = true;
		  	} else if (group=='ta') {
		  		// check password
		  		console.log(res[2]);
		  		if (res[2]=='forest') {
			  		section[socket.id] = sec;
			  		talist[socket.id] = sec;

			  		io.to(socket.id).emit('status','connected.TA');
			  		checkForest(sec); // check that this forest exists
			  		success = true;
		  		}
		  	}
	  	}

	  	if (success) {
	  		console.log(socket.id + ': succesful login');
	  	} else {
	  		console.log(socket.id + ': login failed');
	  	}
	  } catch(err) {
	  	console.log(err);
	  }
  });

  socket.on('request', function(msg) {
  	try {
		if (section[socket.id]!=undefined) {
		  	var trees = ['A','B','C'];
		  	var tree = Number(msg);
		  	if (!isNaN(tree)) {		    
		  		console.log(socket.id + ' requested tree: ' + trees[Number(msg)-1]);

			    var id_sec = section[socket.id];
			    forests[id_sec].emit[socket.id] = tree;
			    console.log('Forest ' + id_sec + ' has ' + Object.keys(forests[id_sec].emit).length + ' pending requests');
		  	}
		} else {
			console.log(socket.id + ': ignoring tree request, need to login');
		}
	} catch(err) {
		console.log(err);
	}
  });

  socket.on('ta_score', function(id) {
  	try {
  		io.to(socket.id).emit('ta_score',id+'.'+scores[id]);
  	} catch(err) {
  		console.log(err);
  	}
  });

  socket.on('ta_reset', function(id) {
  	try {
  		if (talist[id]!=undefined) {
  			forests[talist[id]] = resetForest(forests[talist[id]]);
  		}
  	} catch(err) {
  		console.log(err);
  	}
  });
});

var section = {};
var talist = {};
var scores = {};
var forests = [];

function run() {
	console.log('Tick!');
	taForest(); // send updates to the TAs
	for (fi in forests) {
		var forest = forests[fi];
		forest = updateForest(forest);
		forest = emitForest(forest);
		forests[fi] = forest;
	}

	setTimeout(run,5000);
}

var port = 8080;
http.listen(port, function(){
  console.log('listening on *: ' + port);
  run();
});


//// REQUESTS ////
// Client side:
// 'request' 1/2/3, which tree for next ping

// Server side:
// 'response' 0->5, amount each tree returns on this ping 

function taForest() {
	// TAs
	for (var id in talist) {
		// get forest
		forest = forests[talist[id]];
		// send value updates
		io.to(id).emit('ta_tree','A.'+forest.apples[0]);
		io.to(id).emit('ta_tree','B.'+forest.apples[1]);
		io.to(id).emit('ta_tree','C.'+forest.apples[2]);
		// send squirrel updates
		// all student IDs with squirrels
		ids = Object.keys(forest.emit);
		// send key and tree
		for (i in ids) {
			cid = ids[i];
			io.to(id).emit('ta_squirrel',cid+'.'+forest.emit[cid]);
		}

		io.to(id).emit('ta_alldone','');
	}
}

function updateForest(forest) {
	return forest;
	// Skipping stochastic updates
	var rA = Math.random(),
		rB = Math.random(),
		rC = Math.random();

	A = forest.apples[0];
	B = forest.apples[1];
	C = forest.apples[2];

	if (rA<0.1) {A++;} else if (rA<0.2) {A--;}
	if (A<0) {A=0;}
	if (rB<0.1) {B++;} else if (rB<0.2) {B--;}
	if (B<0) {B=0;}
	if (rC<0.1) {C++;} else if (rC<0.2) {C--;}
	if (C<0) {C=0;}

	forest.apples = [A,B,C];

	return forest;
}

function taDisconnect(sid) {
	for (var id in talist) {
		io.to(id).emit('ta_disconnect',sid);
	}
}

function emitForest(forest) {
	var trackEmit = forest['emit'];

	var apples = [0,0,0];

	var count = [0,0,0];

	// First check the apple count
	for (var id in trackEmit) {
		count[trackEmit[id]-1]++;
	}

	for (var i=0;i<3;i++) {
		apples[i] = forest.apples[i]/count[i];
	}

	var trees = ['A','B','C'];
	for (var id in trackEmit) {
		tree = trackEmit[id]-1;
		var amt = 0;
		if (apples[tree]>=1) {
			amt = Math.round(apples[tree]);
		} else {
			if (Math.random() < amt) {
				amt = 1;
			}
		}
		io.to(id).emit('tree'+trees[tree],amt);
		if (!scores[id]) {scores[id]=0;}
		scores[id] += amt;
	}
	trackEmit = {};

	forest['emit'] = trackEmit;

	return forest;
}

function resetForest(forest) {
	forest.apples = [getRandomInt(5,25),getRandomInt(5,25),getRandomInt(5,25)];
	return forest;
}

function initForest() {
	// Build up a forest variable
	forest = {};
	forest.apples = [getRandomInt(5,25),getRandomInt(5,25),getRandomInt(5,25)];

	forest['emit'] = {}; // dictionary to track who to emit to

	return forest;
}

function checkForest(num) {
	if (!forests[num]) {
		console.log('A new forest is growing: ' + num);
		forests[num] = initForest();
	}
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}