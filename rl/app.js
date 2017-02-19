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

  socket.on('ta_reset', function() {
  	try {
  		var id = socket.id;
  		if (talist[id]!=undefined) {
  			console.log('Reset for forest: ' + talist[id]);
  			forests[talist[id]] = resetForest(forests[talist[id]]);
  		}
  	} catch(err) {
  		console.log(err);
  	}
  });

  socket.on('ta_alive', function() {
  	try {
  		forests[talist[socket.id]].alive = !forests[talist[socket.id]].alive;
  		io.to(socket.id).emit('ta_alive',forests[talist[socket.id]].alive);
  	} catch(err) {
  		console.log(err);
  	}
  });

  socket.on('ta_dropmode', function() {
  	try {
  		if (forests[talist[socket.id]].drop=='prob') {
  			forests[talist[socket.id]].drop = 'comp';
  		} else {
  			forests[talist[socket.id]].drop = 'prob';
  		}
  		io.to(socket.id).emit('ta_dropmode',forests[talist[socket.id]].drop);
  		console.log(forests[talist[socket.id]].drop);
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
	// send tick message
	for (var id in section) {
		io.to(id).emit('tick');
	}
	taForest(); // send updates to the TAs
	for (fi in forests) {
		// check that a TA is connected 
		var forest = forests[fi];
		if (forest.alive) {
			forest = emitForest(forest);
			forests[fi] = forest;
		} else {
			console.log('Forest ' + fi + ' is not alive.');
		}
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
		// if (forest.drop=='prob') {
			io.to(id).emit('ta_tree','A,'+forest.probs[0]);
			io.to(id).emit('ta_tree','B,'+forest.probs[1]);
			io.to(id).emit('ta_tree','C,'+forest.probs[2]);
		// } else {
		// 	// return expected # of apples
		// 	io.to(id).emit('ta_tree','A,'+forest.apples[0]);
		// 	io.to(id).emit('ta_tree','B,'+forest.apples[1]);
		// 	io.to(id).emit('ta_tree','C,'+forest.apples[2]);
		// }
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

function taDisconnect(sid) {
	for (var id in talist) {
		io.to(id).emit('ta_disconnect',sid);
	}
}

function emitForest(forest) {
	var trackEmit = forest['emit'];
	var trees = ['A','B','C'];

	if (forest.drop == 'prob') {
		// for each person simply calculate as probability
		for (var id in trackEmit) {
			if (Math.random() < forest.probs[trackEmit[id]-1]) {
				io.to(id).emit('tree'+trees[trackEmit[id]-1],1);
				scores[id] += 1;
			} else {
				io.to(id).emit('tree'+trees[trackEmit[id]-1],0);
			}
		}
	} else {
		// competitive: trees don't always drop AND they drop limited apples
		var count = [0,0,0];
		// First check the count of squirrels at each tree
		for (var id in trackEmit) {
			count[trackEmit[id]-1]++;
		}
		// We'll count the total squirrels and set the # of apples
		// to always be less than that
		var apples = [0,0,0];
		var N = 0;
		for (var id in section) {
			if (section[id]==forest.number) {N++;}
		}

		console.log(N);

		for (var i=0;i<3;i++) {
			apples[i] = (count[i]<(Math.round(0.3*N))) ? 1 : Math.max(0.25,(1-(count[i]/N)));
		}
		console.log(apples);

		for (var id in trackEmit) {
			var amt = 0;
			var tree = trackEmit[id]-1;
			if (Math.random() < forest.probs[tree]) {
				// tree dropped: check if enough apples available
				if (apples[tree]==1) {
					amt = 1;
				} else if (Math.random()<apples[tree]) {
					amt = 1;
				}
			}

			io.to(id).emit('tree'+trees[tree],amt);
			if (!scores[id]) {scores[id]=0;}
			scores[id] += amt;
		}
	}

	// reset trackEmit
	trackEmit = {};
	forest['emit'] = trackEmit;

	return forest;
}

var probOpts = [[0.8,0.5,0.2],[0.8,0.2,0.5],[0.5,0.8,0.2],[0.5,0.2,0.8],[0.2,0.5,0.8],[0.2,0.8,0.5]];

function resetForest(forest) {
	forest.probs = probOpts[getRandomInt(0,probOpts.length)];
	return forest;
}

function initForest(num) {
	// Build up a forest variable
	forest = {};
	forest.probs = probOpts[getRandomInt(0,probOpts.length)];
	forest.alive = false;
	forest.drop = 'prob'; // or COMP
	forest.number = num;
	forest['emit'] = {}; // dictionary to track who to emit to

	return forest;
}

function checkForest(num) {
	if (!forests[num]) {
		console.log('A new forest is growing: ' + num);
		forests[num] = initForest(num);
	}
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}