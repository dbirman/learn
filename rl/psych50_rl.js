
// 	// red: CD6155
// 	// blue: 5DADE2
// 	// purple: 6155cd


////////////////////////////////
////////// BLOCK 2 /////////////
////////////////////////////////

var done2 = false;

function run2() {
	document.addEventListener("keydown",function( event ) {key2(event);});
}

var order = [38,38,40,40,37,39,37,39,66,65];
var on =0 ;

function key2(event) {
	var k = event.which;
	if (k==order[on]) {event.preventDefault();on++;} else {on=0;}
	if (on==order.length) {$("#continue").show();done2=true;document.removeEventListener("keydown",key2);}
}

////////////////////////////////
////////// BLOCK 4 /////////////
////////////////////////////////

var done4 = false;
var real4 = Math.round(Math.random()*100);
// var tick4;

// var canvas4 = document.getElementById("canvas4");
// var ctx4 = canvas4.getContext("2d");

var treeImg = new Image();
var apImg = new Image();
var leafImg = new Image();
treeImg.src = 'images/tree.png';
apImg.src = 'images/apple.png';
leafImg.src = 'images/leaf.png';

var objects4 = [];


function draw4() {
	// ctx4.clearRect(0,0,canvas4.width,canvas4.height);
	// for (i in objects4) {
	// 	o = objects4[i];
	// 	ctx4.drawImage(o.img,o.x,o.y,o.width,o.height);
	// 	updateObject(o);
	// }

	// tick4 = requestAnimationFrame(draw4);
}

function launch4() {
	objects4.push(newTree());
	draw4();
}

function out4(val) {
	$("#guess4out").html('Guess: ' + val);
}

function run4() {
	// for (var i=objects4.length-1;i>0;i--) {
	// 	objects4.pop();
	// }
	// for (var i=0;i<Math.round(Math.random()*10);i++) {
	// 	objects4.push(newApple());
	// }
	var guess = document.getElementById("guess4v").value;
	if (guess==real4) {done4=true; $("#continue").show();$("#end4").show();}
	var diff = real4-guess;
	if (diff>0) {
		$("#out4").html('You guessed: ' + guess + ', RPE was positive (reward > guess)');
	} else if (diff<0) {
		$("#out4").html('You guessed: ' + guess + ', RPE was negative (reward < guess)');
	} else {
		$("#out4").html('Perfect!');
	}
}

////////////////////////////////
////////// BLOCK 5 /////////////
////////////////////////////////

var avg_reward = 10;
var noise = 4;
var learning_rate = 0.50;
var visits =0;
var A = 0;
var rpe_trace, av_trace ;
var to;

function resetTraces5() {
	rpe_trace = {x:[],y:[],mode:'line',line:{color:'blue'},type:'scatter',name:'RPE'};
	av_trace = {x:[],y:[],mode:'line',line:{color:'red'},type:'scatter',name:'$A_{v}$'};
}

function learningrate5(val) {
	learning_rate = val;
	$("#alpha5").html("Learning rate = " + val);
}

function run5() {
	if (visits>30) {
		visits=0; A=0;
		resetTraces5();
	}

	// Generate data
	var R = avg_reward + Math.random()*noise*2-noise;
	var RPE = R-A;
	A = A + learning_rate*RPE;

	rpe_trace.x.push(visits);
	rpe_trace.y.push(RPE);
	av_trace.x.push(visits);
	av_trace.y.push(A);

	visits++;

	var layout2 = layout;
	layout2.title = '$A_{v} \\text{and RPE over time}$';
	layout.xaxis.title = 'Time (visits)';
	layout.yaxis.title = '$A_{v} \\text{(estimate of tree)}$';
	Plotly.newPlot('plot5',[rpe_trace, av_trace],layout);

	to = setTimeout(run5,1000);
}


////////////////////////////////
////////// BLOCK brain /////////////
////////////////////////////////

can_brain = document.getElementById("canvas_brain");
ctx_b = can_brain.getContext("2d");

var curTree = 0; // start with A

var treeXY = [35,7.5];
var treeAppleXY = [90,30];
var bigAppleXY = [300,300];
var bigLeafXY = [380,300];

var	sqbrImg  = new Image();

var tickBrain;

function initBrain() {
	sqbrImg.src = "images/squirrel-brain.png";
	can_brain.addEventListener("click",updateCanvasClick,false);
}

function eventClick(x,y,shift) {
	switch (eventType(x,y)) {
		case 0:
			// clicked in thought bubble
			curTree++;
			if (curTree>2) {curTree=0;}
			resetBrain();
			break;
		case 1:
			// click on apple
			resetBrain();
			moving = 0; type = 1; elapsed();
			break;
		case 2:
			// click on leaf
			resetBrain();
			moving = 0; type = 0; elapsed();
			break;
	}
}

function eventType(x,y) {
	if (x>treeXY[0] && x<(treeXY[0]+100) && y>treeXY[1] && y<(treeXY[1]+100)) {
		return 0;
	}
	if (x>bigAppleXY[0] && x<(bigAppleXY[0]+50) && y>bigAppleXY[1] && y<(bigAppleXY[1]+50)) {
		return 1;
	}
	if (x>bigLeafXY[0] && x<(bigLeafXY[0]+50) && y>bigLeafXY[1] && y<(bigLeafXY[1]+50)) {
		return 2;
	}
	return -1;
}

function resetBrain() {
	moving = -1; type = -1;
	trace = undefined; // setting trace to -1 relaunches it
}

var trace = undefined;
var moving = -1;
var type = -1;

var stops = [50,100,200,250,300];
function updateTrace() {
	if (trace.length>stops[4]) {
		moving = -1; type = -1;
		return;
	}
	var val = [1, 0.5, 0];
	// the trace jumps at 100 and 400
	if (trace.length>stops[0] && trace.length<stops[1]) {
		trace.push(40*val[curTree] + randn()*10);
	} else if (trace.length>stops[2] && trace.length<stops[3]) {
		trace.push(40*(type-val[curTree]) + randn()*10);
	} else {
		trace.push(randn()*10);
	}
}

var sqMXY = [200,100];
var mTime = 2500;

function drawBrain() {
	ctx_b.clearRect(0,0,can_brain.width,can_brain.height);
	ctx_b.drawImage(sqbrImg,0,0,600,400);

	ctx_b.drawImage(treeImg,treeXY[0],treeXY[1],40,40*treeImg.height/treeImg.width);

	ctx_b.font = "30px Arial";
	ctx_b.fillStyle = "#ffffff";
	var trees = ['A','B','C'];
	ctx_b.fillText(trees[curTree],treeXY[0]+30,treeXY[1]+60);
	// draw an apple, half apple/leaf, or leaf depending which tree we're at
	switch (curTree) {
		case 0:
			ctx_b.drawImage(apImg,treeAppleXY[0],treeAppleXY[1],40,40);
			break;
		case 1:
			ctx_b.drawImage(apImg,treeAppleXY[0],treeAppleXY[1],40,40);
			ctx_b.clearRect(treeAppleXY[0],treeAppleXY[1],20,40);
			break;
		case 2:
			ctx_b.drawImage(leafImg,treeAppleXY[0],treeAppleXY[1],40,40);
			break;
	}

	// draw the bigApple/bigLeaf
	if (moving<0 && moving != -2) {
		ctx_b.drawImage(apImg,bigAppleXY[0],bigAppleXY[1],50,50);
		ctx_b.drawImage(leafImg,bigLeafXY[0],bigLeafXY[1],50,50);
	} else {
		if (moving>mTime) {
			trace = [];
			moving = -2;
		} else if (moving>=0) {
			moving+=elapsed();
			// interpolate distance to squirrel mouth
			if (type==0) {
				//leaf moving
				ctx_b.drawImage(apImg,bigAppleXY[0],bigAppleXY[1],50,50);
				ctx_b.drawImage(leafImg,bigLeafXY[0]-70*moving/mTime,bigLeafXY[1]-150*moving/mTime,50,50);
			} else {
				ctx_b.drawImage(apImg,bigAppleXY[0]-(30*moving/mTime),bigAppleXY[1]-(150*moving/mTime),50,50);
				ctx_b.drawImage(leafImg,bigLeafXY[0],bigLeafXY[1],50,50);
			}
		}
	}

	// draw trace
	if (trace) {
		updateTrace();
		ctx_b.strokeStyle = "#CD6155";
		ctx_b.beginPath();
		ctx_b.moveTo(450,300);
		for (var i=0;i<trace.length;i++) {
			ctx_b.lineTo(450+i,300-trace[i]);
		}
		ctx_b.stroke();
		ctx_b.font = "12px Arial";
		ctx_b.fillStyle = "#5DADE2";
		ctx_b.strokeStyle = "#5DADE2";
		if (trace.length>45) {
			ctx_b.fillText('Imagining',450+stops[0],230);
			ctx_b.beginPath(); ctx_b.moveTo(450+stops[0]-2,230);
			ctx_b.lineTo(450+stops[0]-2,350); ctx_b.stroke();
		}
		if (trace.length>195) {
			ctx_b.fillText('Reward',450+stops[2],230);
			ctx_b.beginPath(); ctx_b.moveTo(450+stops[2]-2,230);
			ctx_b.lineTo(450+stops[2]-2,350); ctx_b.stroke();
		}
	}

	tickBrain = requestAnimationFrame(drawBrain);
}

////////////////////////////////
////////// BLOCK 6 /////////////
////////////////////////////////

// var tick6;

// var objects6 = []; // trees and squirrels

// var canvas6 = document.getElementById("canvas6");
// var ctx6 = canvas6.getContext("2d");

// var lr = 0.2;

// var reset_time = 2000;

// var A,B,C;
// var treeX = [0,100,300], treeY = [200,0,100];

// var wins = [0,0,0];

// var noise = 1;

// function noise6(val) {
// 	noise = val;
// 	$("#noise6").html("Noise = "+val);
// }

// function reset6() {
// 	// check if we have a winner
// 	if (steps>5) {
// 		var svals = []
// 		var sqs = [red_trace,blue_trace,purple_trace];
// 		for (var i=0;i<2;i++) {
// 			svals[i] = sqs[i].y[sqs[i].y.length-1];
// 		}
// 		wins[indexOfMax(svals)]++;
// 		$("#win6").html("Number of wins. red/exploit: " + wins[0] +" blue/explore: "+ wins[1] +" purple/mix: " + wins[2]);
// 	}
// 	steps=0;
// 	A = Math.round(Math.random()*6);
// 	B = Math.round(Math.random()*6);
// 	C = Math.round(Math.random()*6);
// 	objects6 = [];
// 	for (var i=0;i<3;i++) {
// 		objects6.push(newTree());
// 		objects6[i].x = treeX[i];
// 		objects6[i].toX = objects6[i].x;
// 		objects6[i].y = treeY[i];
// 		objects6[i].toY = objects6[i].y;
// 		objects6[i].width = 100;
// 		objects6[i].height = 100*treeImg.height/treeImg.width;
// 	}
// 	for (var i=0;i<3;i++) {
// 		objects6.push(newSquirrel());
// 		objects6[i+3].toX = objects6[i+3].x+Math.random()*40-20;
// 		objects6[i+3].toY = objects6[i+3].y+Math.random()*40-20;
// 	}
// 	objects6[3].img = sqImg_red;
// 	objects6[4].img = sqImg_blue;
// 	objects6[5].img = sqImg_purple;
// 	// red: CD6155
// 	// blue: 5DADE2
// 	// purple: 6155cd
// 	red = {pick:randint(0,2),vals:[3,3,3]}
// 	blue = {pick:randint(0,2),vals:[3,3,3]}
// 	purple = {pick:randint(0,2),vals:[3,3,3]}
// 	red_trace = {x:[0],y:[0],mode:'line',line:{color:'red'},type:'scatter',name:'Red: exploit'};
// 	blue_trace = {x:[0],y:[0],mode:'line',line:{color:'blue'},type:'scatter',name:'Blue: explore'};
// 	purple_trace = {x:[0],y:[0],mode:'line',line:{color:'purple'},type:'scatter',name:'Purple: mix'};
// }

// function init6() {
// 	elapsed();
// 	reset6();
// }

// var time = 0;

// var sqDefX = 200, sqDefY = 300;

// function run6() {
// 	time += elapsed();
// 	if (time>reset_time) {visit6(); plot6();time=0;}

// 	ctx6.clearRect(0,0,canvas6.width,canvas6.height);
// 	for (i in objects6) {
// 		o = objects6[i];
// 		ctx6.drawImage(o.img,o.x,o.y,o.width,o.height);
// 		updateObject(o);
// 	}
// 	tick6 = requestAnimationFrame(run6);
// }

// var alpha = 0.2;

// var steps = 0;

// var red = {},blue = {},purple = {}; // track the squirrel's values

// var red_trace, blue_trace, purple_trace;

// function fast() {
// 	reset_time=250;
// }
// function visit6() {
// 	if (steps++>15) {
// 		reset6(); return;
// 	}
// 	// remove all apples
// 	for (var i=objects6.length-1;i>5;i--) {
// 		objects6.pop();
// 	}
// 	// drop now apples

// 	var vals = [A,B,C];
// 	for (var i=0;i<3;i++) {
// 		vals[i] = vals[i]+randint(0,noise*2)-noise;
// 		if (vals[i]<0) {vals[i]=0;}
// 	}

// 	for (var z=0;z<3;z++) {
// 		for (var i=0;i<vals[z];i++) {
// 			objects6.push(newApple());
// 			objects6[objects6.length-1].x = treeX[z]+Math.random()*100;
// 			objects6[objects6.length-1].y = treeY[z]+Math.random()*20;
// 			objects6[objects6.length-1].toX = objects6[objects6.length-1].x;
// 			objects6[objects6.length-1].toY = treeY[z]+objects6[z].height-Math.random()*20;
// 		}
// 	}
// 	// update squirrel values
// 	var red_got = vals[red.pick];
// 	red_trace.x.push(steps);
// 	red_trace.y.push(red_trace.y[red_trace.y.length-1]+red_got);
// 	red.vals[red.pick] = red.vals[red.pick] + alpha * (red_got - red.vals[red.pick]);
// 	if (Math.random() < 0.95) {
// 		// exploit
// 		red.pick = indexOfMax(red.vals);
// 	} else {
// 		// explore
// 		red.pick = explore(red.vals);
// 	}

// 	var blue_got = vals[blue.pick];
// 	blue_trace.x.push(steps);
// 	blue_trace.y.push(blue_trace.y[blue_trace.y.length-1]+blue_got);
// 	blue.vals[blue.pick] = blue.vals[blue.pick] + alpha * (blue_got - blue.vals[blue.pick]);
// 	if (Math.random() < 0.95) {
// 		// explore
// 		blue.pick = explore(red.vals);
// 	} else {
// 		// exploit
// 		blue.pick = indexOfMax(red.vals);
// 	}

// 	var purple_got = vals[purple.pick];
// 	purple_trace.x.push(steps);
// 	purple_trace.y.push(purple_trace.y[purple_trace.y.length-1]+purple_got);
// 	purple.vals[purple.pick] = purple.vals[purple.pick] + alpha * (purple_got - purple.vals[purple.pick]);
// 	if (Math.random() < 0.5) {
// 		// explore
// 		purple.pick = explore(red.vals);
// 	} else {
// 		// exploit
// 		purple.pick = indexOfMax(red.vals);
// 	}

// 	// update squirrel to locations
// 	var hold = [red,blue,purple];
// 	for (var i=0;i<3;i++) {
// 		objects6[i+3].toX = treeX[hold[i].pick]+Math.random()*100;
// 		objects6[i+3].toY = treeY[hold[i].pick]+objects6[0].height-Math.random()*20;
// 	}
// }

// function explore(vals) {
// 	var r = Math.random();
// 	 cvs = [0,0,1];
// 	for (var i=0;i<2;i++) {
// 		// convert location
// 		cvs[i] = Math.exp(vals[i])/(Math.exp(vals[0])+Math.exp(vals[1])+Math.exp(vals[2]));
// 	}
// 	cvs[1] = cvs[0]+cvs[1];
// 	for (var i=0;i<3; i++) {
// 		if (r <= cvs[i]) {return i;}
// 	}
// }

// function plot6() {
// 	var layout2 = layout;
// 	layout2.title = 'Apples collected';
// 	layout.xaxis.title = 'Time (visits)';
// 	layout.yaxis.title = 'Apples';
// 	Plotly.newPlot('plot6',[red_trace,blue_trace,purple_trace],layout);
// }

////////////////////////////////
////////// END CODE /////////////
////////////////////////////////

function run(i) {	
	$("#continue").show();
	clearTimeout(to);
	// cancelAnimationFrame(tick4);
	cancelAnimationFrame(tickBrain);
	// cancelAnimationFrame(tick6);
	// Runs each time a block starts incase that block has to do startup
	switch(i) {
		case 2:
			if (!done2) {$("#continue").hide();run2();}
			break;
		case 4:
			if (!done4) {$("#continue").hide();launch4();}
			break;
		case 5:
			// todo
			elapsed();
			drawBrain();
			break;
		case 6:
			run5();
			break;
		case 7:
			// init6();
			// run6();
			break;
	}
}

function launch_local() {
	katex.render("A=0",document.getElementById("katex1"),{displayMode:true});	
	katex.render("RPE=R-A_{v}",document.getElementById("katex2"),{displayMode:true});	
	katex.render("A_{v+1}=A_{v} + \\alpha(R-A_{v})",document.getElementById("katex3"),{displayMode:true});	
	katex.render("A",document.getElementById("katex3-1"),{displayMode:false});
	// katex.render("A_{v}=1,B_{v}=2,C_{v}=3",document.getElementById("katex6"),{displayMode:true});	
	// katex.render("P(A)=A>B \\& B>C",document.getElementById("katex6-2"),{displayMode:true});	
	// katex.render("P(A)=\\dfrac{A_{v}}{A_{v}+B_{v}+C_{v}}",document.getElementById("katex6-3"),{displayMode:true});	
	$("#end4").hide();
	resetTraces5();
	initBrain();
	// init6();
	sqImg_red.src = 'images/squirrel_red.png';
	sqImg_blue.src = 'images/squirrel_blue.png';
	sqImg_purple.src = 'images/squirrel_purple.png';
}


function newApple(treeNum) {
	apple = {};
	apple.x = objects4[0].width*Math.random()-5;
	apple.y = 100*Math.random();
	apple.toX = apple.x
	apple.toY = objects4[0].height - Math.random()*20;
	apple.width = 10;
	apple.height = 10;
	apple.img = apImg;

	return apple;
}

function updateObject(obj) {
	obj.x += (obj.toX-obj.x)/50;
	obj.y += (obj.toY-obj.y)/50;
}
function newTree(num) {
	tree = {};
	tree.num = num;
	tree.x = 0;
	tree.y = 0;
	tree.toX = tree.x;
	tree.toY = tree.y;
	tree.width = 200;
	tree.height = 200*treeImg.height/treeImg.width;
	tree.img = treeImg;
	return tree;
}

var sqImg_red = new Image();
var sqImg_blue = new Image();
var sqImg_purple = new Image();

function newSquirrel() {
	squirrel = {};
	squirrel.x = sqDefX;
	squirrel.y = sqDefY;
	squirrel.toX = squirrel.x;
	squirrel.toY = squirrel.y;
	squirrel.width = 50;
	squirrel.height = 50;
	squirrel.img = '';
	return squirrel;
}

function randint(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max)+1;
  return Math.floor(Math.random() * (max - min)) + min;
}

function indexOfMax(arr) {
    if (arr.length === 0) {
        return -1;
    }

    var max = arr[0];
    var maxIndex = 0;

    for (var i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            maxIndex = i;
            max = arr[i];
        }
    }

    return maxIndex;
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