
var socket = io();

var score = 0;

function request(tree) {
	socket.emit('request',tree);
}

function requestReset() {
	if (TA) {
		socket.emit('ta_reset','');
	}
}

socket.on('tick', function() {
	progress=0;
});

socket.on('treeA', function(msg){
	defaultSquirrel();
	console.log('tree A: ' + msg);
	var num = Number(msg);
	if (num>0) {
		addApples(Number(msg),1);
	} else {
		addLeaf(1);
	}
});

socket.on('treeB', function(msg){
	defaultSquirrel();
	console.log('tree B: ' + msg);
	var num = Number(msg);
	if (num>0) {
		addApples(Number(msg),2);
	} else {
		addLeaf(2);
	}
});

socket.on('treeC', function(msg){
	defaultSquirrel();
	console.log('tree C: ' + msg);
	var num = Number(msg);
	if (num>0) {
		addApples(Number(msg),3);
	} else {
		addLeaf(3);
	}
});

socket.on('status', function(msg) {
	msg = msg.split('.');
	var connected = msg[0];
	var group = msg[1];
	console.log('Received connection status: ' + connected + ' as ' + group);
	if (group=='TA') {
		TA = true;
		$("#ta_stuff").show();
		launchCanvas();
	} else if (group=='student') {
		TA = false;
		launchCanvas();
	}
})

var TA;

function login(group,section,password) {
	var str;
	if (group=='student') {
		str = group+'.'+section;
	} else if (group=='ta') {
		str = group+'.'+section+'.'+password;
	}
	console.log('Sending login string: ' + str);
	socket.emit('login',str);
}

function launch() {
	prev_tick = now();
	$("#viewport").hide();
 	treeImg.src = 'images/tree.png';
 	sqImg.src = 'images/squirrel.png';
 	apImg.src = 'images/apple.png';
 	leafImg.src = 'images/leaf.png';
	canvas.addEventListener("click",updateCanvasClick,false);
	console.log('A friendly message from Dan: This isn\'t a CS class--there are no bonus points for crashing the server.');
}

function ta_alive() {
	if (TA) {
		socket.emit('ta_reset');
		socket.emit('ta_alive');
	}
}

socket.on('ta_alive', function(alive) {
	if (alive) {
		$("#alive").text('Kill forest (also resets)');
	} else {
		$("#alive").text('Bring forest to life');
	}
})

function ta_dropmode() {
	if (TA) {
		socket.emit('ta_dropmode');
	}
}

socket.on('ta_dropmode', function(dropmode) {
	if (dropmode=='prob') {
		$("#comp").text('Switch to competitive');
	} else {
		$("#comp").text('Switch to probabilistic');
	}
})


window.onload = function() {launch();};

function taLogin() {
	pass = document.getElementById("password").value;
	section = Number(document.getElementById("section").value);
	
	if ((pass!=undefined) && (section!=undefined)) {
		login('ta',section,pass);
	}
}

function studentLogin() {
	section = Number(document.getElementById("section").value);

	if (section<0 || section>=12) {
		alert('Nice try. This incident will be reported. See https://xkcd.com/838/');
		return;
	}

	if (section!=undefined) {
		login('student',section,'');
	}
}

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var treeImg = new Image();
var sqImg = new Image();
var apImg = new Image();
var leafImg = new Image();

function launchCanvas() {
	// Begin canvas functionality
	$("#login").hide();
	$("#viewport").show();

	if (!TA) {
		// student, one squirrel
		squirrels.push(newSquirrel());
	} else {
		// TA, dynamic squirrels (tied to info coming from server)
		squirrels = {};
	}
	// add squirrel
	objects.push(newTree(1));
	objects.push(newTree(2));
	objects.push(newTree(3));

	draw();
}

var treeX = [100,400,600];
var treeY = [400,50,300];

var sqDefX = 450;
var sqDefY = 650;

var treeScale = 200;
var appleScale = 10;

var objects = [];
var squirrels = [];

function draw() {

	ctx.clearRect(0,0,canvas.width,canvas.height);

	//draw trees and apples
	for (i in objects) {
		o = objects[i];
		ctx.drawImage(o.img,o.x,o.y,o.width,o.height);
		updateObject(o);
	}
	// draw squirrel
	for (i in squirrels) {
		o = squirrels[i];
		ctx.drawImage(o.img,o.x,o.y,o.width,o.height);
		updateObject(o);
	}

	drawProgress();

	ctx.font = "30px Arial";
	ctx.fillStyle = "#ffffff";
	if (TA) {
		if (ta_debug) {
			// draw the tree values
			var trees = ['A','B','C'];
			for (var i=0;i<3;i++) {
				ctx.fillText('Tree ' + trees[i] + ': ' + eval('ta_'+trees[i]),treeX[i],treeY[i]);
			}
		}
	} else {
		//draw score
		ctx.fillText("Apples: " + score,700,30);
	}
	requestAnimationFrame(draw);
}

var progress = 0;

var prev_tick;

function elapsed() {
	// Returns time since the last call to elapsed
	var elapsed = now()-prev_tick;
	prev_tick = now();
	return elapsed;
}

function now() {
	return performance.now();
}

function drawProgress() {
	progress += elapsed();
	var time = progress/5000;
	ctx.fillStyle = "#ffffff";
	ctx.fillRect(0,0,400,30);
	ctx.fillStyle = "#5DADE2";
	ctx.fillRect(0,0,time*400,30);
	ctx.fillText("Next tick...",0,0);
}

function addApples(num,tree) {
	for (var i=0;i<num;i++) {
		score++;
		objects.push(newApple(tree-1));
	}
	if (score>=1) {
		squirrels[0].width = Math.round(Math.log(score)*25/Math.log(2));
		squirrels[0].height = squirrels[0].width;
	}
	if (score>=100 && sqImg.src != "images/deadpool.png") {
		sqImg.src = "images/deadpool.png";
	}
}

function newApple(treeNum) {
	apple = {};
	apple.x = treeX[treeNum] + treeScale*Math.random()-5;
	apple.y = treeY[treeNum] + 100*Math.random();
	apple.toX = apple.x
	apple.toY = treeY[treeNum] + objects[0].height - Math.random()*20;
	apple.width = 10;
	apple.height = 10;
	apple.img = apImg;

	return apple;
}

function addLeaf(tree) {
	objects.push(newLeaf(tree-1));
}

function newLeaf(treeNum) {
	leaf = {};
	leaf.x = treeX[treeNum] + treeScale*Math.random()-5;
	leaf.y = treeY[treeNum] + 100*Math.random();
	leaf.toX = leaf.x
	leaf.toY = treeY[treeNum] + objects[0].height - Math.random()*20;
	leaf.width = 20;
	leaf.height = 20;
	leaf.img = leafImg;

	return leaf;
}

function updateObject(obj) {
	obj.x += (obj.toX-obj.x)/50;
	obj.y += (obj.toY-obj.y)/50;
}

function defaultSquirrel() {
	squirrels[0].toX = sqDefX;
	squirrels[0].toY = sqDefY;
}

function newTree(num) {
	tree = {};
	tree.num = num;
	tree.x = treeX[num-1];
	tree.y = treeY[num-1];
	tree.toX = tree.x;
	tree.toY = tree.y;
	tree.width = treeScale;
	tree.height = treeScale*treeImg.height/treeImg.width;
	tree.img = treeImg;
	return tree;
}

function newSquirrel() {
	squirrel = {};
	squirrel.x = sqDefX;
	squirrel.y = sqDefY;
	squirrel.toX = squirrel.x;
	squirrel.toY = squirrel.y;
	squirrel.width = 25;
	squirrel.height = 25;
	squirrel.img = sqImg;
	return squirrel;
}

function eventClick(x,y,shift) {
	if (TA) {
		ta_debug = !ta_debug;
		return;
	}
	// Otherwise! Figure out if we clicked on a tree
	// and if so make a request for that tree
	for (var i=0;i<3;i++) {
		if (checkBounds(i,x,y)) {
			// request and move squirrel
			request(i+1);
			squirrel.toX = treeX[i]+tree.width/2;
			squirrel.toY = treeY[i]+tree.height-50;
		}
	}
}

function checkBounds(treeNum,x,y) {
	return (x>treeX[treeNum]) && (x<(treeX[treeNum]+treeScale)) && (y>treeY[treeNum]) && (y<(treeY[treeNum]+treeScale*treeImg.height/treeImg.width));
}

function updateCanvasClick(evt) {
  evt.preventDefault();
  var canvas = evt.target;
  var out = updateCanvas(evt,canvas);
  eventClick(out[0],out[1],evt.shiftKey);
}

function updateCanvas(evt,canvas) {
  var rect = canvas.getBoundingClientRect(), // abs. size of element
    scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for X
    scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y

  var x =  (evt.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
    y =  (evt.clientY - rect.top) * scaleY     // been adjusted to be relative to element
  return [x,y];
}

//////////////////
// TA FUNCTIONS //
//////////////////

var ta_A, ta_B, ta_C;

var ta_debug = false;

// Updates a tree value
// tree.value
socket.on('ta_tree', function(msg){
	msg = msg.split(',');
	tree = msg[0];
	value = Number(msg[1]);
	value = Math.round(value*100)/100;
	if (tree=='A') {
		ta_A = value;
	}
	if (tree=='B') {
		ta_B = value;
	}
	if (tree=='C') {
		ta_C = value;
	}
});

// Updates knowledge about a student
// id.tree.score
socket.on('ta_squirrel', function(msg) {
	msg = msg.split('.');
	id = msg[0];
	tree = Number(msg[1])-1;
	if (squirrels[id]==undefined) {
		squirrels[id] = newSquirrel();
	}
	squirrels[id].toX = treeX[tree]+Math.random()*objects[0].width;
	squirrels[id].toY = treeY[tree]+200+(Math.random()*(objects[0].height-200));
	squirrels[id].updated = true;
});

socket.on('ta_alldone', function(msg) {
	ids = Object.keys(squirrels);
	for (i in ids) {
		id = ids[i];
		if (!squirrels[id].updated) {
			squirrels[id].toX = sqDefX + Math.random()*50 - 25;
			squirrels[id].toY = sqDefY + Math.random()*50 - 25;
		}
		squirrels[id].updated = false;
	}
	plotScores();
});

socket.on('ta_disconnect', function(msg) {
	if (squirrels[msg]!=undefined) {
		delete squirrels[msg];
	}
});

scores = {};

function getScore(id) {
	socket.emit('ta_score',id);
}

socket.on('ta_score', function(msg){
	var msg = msg.split('.');
	var id = msg[0];
	var score = Number(msg[1]);
	if (scores[id]==undefined) {
		scores[id] = [];
	}
	scores[id].push(score);
});

function plotScores() {
	// Request all scores for the current squirrels
	var ids = Object.keys(squirrels);
	for (var i=0;i<ids.length;i++) {
		var id = ids[i];
		getScore(id);
	}
	setTimeout(plotScores_,2000);
}


// private plotting function
function plotScores_() {
	var ids = Object.keys(squirrels);
	var traces = [];

	for (var i=0;i<ids.length;i++) {
		var id = ids[i];
		if (scores[id]!=undefined) {
			var trace = {
				x: Array.apply(null, Array(scores[id].length)).map(function (_, i) {return i;}),
				y: scores[id]
			}
			traces.push(trace);
		}
	}

	var layout2 = layout;
	layout2.xaxis.title = 'Time (ticks)';
	// layout2.xaxis.range = [0,40];
	layout2.yaxis.title = 'Apples';
	// layout2.yaxis.range = [-25,25];
	// layout2.width = 700;
	// layout2.height = 400;
	Plotly.newPlot('ta_plot',traces,layout2);
}


var layout = {
	title: 'Default Layout (set title)',
	xaxis: {color:'#ffffff',showgrid:false,zeroline:true},
	yaxis: {color:'#ffffff',showgrid:false,zeroline:true},
	autosize: false,
	plot_bgcolor:'rgba(1,1,1,0)',
	paper_bgcolor:'rgba(1,1,1,0)',
	font: {
		color: '#ffffff'
	}
}