
var socket = io();

var score = 0;

function request(tree) {
	socket.emit('request',tree);
}

socket.on('treeA', function(msg){
	defaultSquirrel();
	console.log('tree A: ' + msg);
	addApples(Number(msg),1);
});

socket.on('treeB', function(msg){
	defaultSquirrel();
	console.log('tree B: ' + msg);
	addApples(Number(msg),2);
});

socket.on('treeC', function(msg){
	defaultSquirrel();
	console.log('tree C: ' + msg);
	addApples(Number(msg),3);
});

socket.on('status', function(msg) {
	msg = msg.split('.');
	var connected = msg[0];
	var group = msg[1];
	console.log('Received connection status: ' + connected + ' as ' + group);
	if (group=='ta') {
		TA = true;
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
	$("#viewport").hide();
 	treeImg.src = 'images/tree.png';
 	sqImg.src = 'images/squirrel.png';
 	apImg.src = 'images/apple.png';
	canvas.addEventListener("click",updateCanvasClick,false);
}


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

	if (section!=undefined) {
		login('student',section,'');
	}
}

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var treeImg = new Image();
var sqImg = new Image();
var apImg = new Image();

function launchCanvas() {
	// Begin canvas functionality
	$("#login").hide();
	$("#viewport").show();

	// add squirrel
	objects.push(newTree(1));
	objects.push(newTree(2));
	objects.push(newTree(3));

	draw();
}

var treeX = [100,400,600];
var treeY = [400,50,300];

var sqDefX = canvas.width/2;
var sqDefY = canvas.height-200;

var squirrelObj = newSquirrel();

var treeScale = 200;
var appleScale = 10;

var objects = [];

function draw() {

	ctx.clearRect(0,0,canvas.width,canvas.height);

	//draw trees and apples
	for (i in objects) {
		o = objects[i];
		ctx.drawImage(o.img,o.x,o.y,o.width,o.height);
		objects[i] = updateObject(o);
	}
	// draw squirrel
	o = squirrelObj;
	ctx.drawImage(o.img,o.x,o.y,o.width,o.height);
	objects[i] = updateObject(o);

	//draw score
	ctx.font = "30px Arial";
	ctx.fillStyle = "#ffffff";
	ctx.fillText("Apples: " + score,canvas.width-150,30);

	requestAnimationFrame(draw);
}

function addApples(num,tree) {
	for (var i=0;i<num;i++) {
		score++;
		objects.push(newApple(tree-1));
	}
}

function newApple(treeNum) {
	apple = {};
	apple.x = treeX[treeNum] + treeScale*Math.random()-5;
	apple.y = treeY[treeNum] + 100*Math.random();
	apple.toX = apple.x
	apple.toY = apple.y + objects[0].height - Math.random()*20;
	apple.width = 10;
	apple.height = 10;
	apple.img = apImg;

	return apple;
}

function updateObject(obj) {
	obj.x += (obj.toX-obj.x)/50;
	obj.y += (obj.toY-obj.y)/50;

	return obj;
}

function defaultSquirrel() {
	squirrelObj.toX = sqDefX;
	squirrelObj.toY = sqDefY;
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
	squirrel.width = 100;
	squirrel.height = 100;
	squirrel.img = sqImg;
	return squirrel;
}

function eventClick(x,y,shift) {
	if (TA) {
		console.log('TA has no direct input');
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




