
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
var real4 = Math.round(Math.random()*100)/10;
var tick4;

var canvas4 = document.getElementById("canvas4");
var ctx4 = canvas4.getContext("2d");

var treeImg = new Image();
var apImg = new Image();
treeImg.src = 'images/tree.png';
apImg.src = 'images/apple.png';

var objects4 = [];


function draw4() {
	ctx4.clearRect(0,0,canvas4.width,canvas4.height);
	for (i in objects4) {
		o = objects4[i];
		ctx4.drawImage(o.img,o.x,o.y,o.width,o.height);
		updateObject(o);
	}

	tick4 = requestAnimationFrame(draw4);
}

function launch4() {
	objects4.push(newTree());
	draw4();
}

function run4() {
	for (var i=1;i<objects4.length;i++) {
		objects4.pop();
	}
	for (var i=0;i<Math.round(Math.random()*10);i++) {
		objects4.push(newApple());
	}
	var guess = document.getElementById("guess4v").value;
	if (guess==real4) {done4=true; $("#continue").show();cancelAnimationFrame(tick4);$("#end4").show();}
	var diff = real4-guess;
	if (diff>0) {
		$("#out4").html('You guessed: ' + guess + ', RPE was +');
	} else {
		$("#out4").html('You guessed: ' + guess + ', RPE was -');
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
////////// BLOCK 6 /////////////
////////////////////////////////

var tick6;

var objects = []; // trees and squirrels

var exploit; // A/B/C for exploit model
var explore;
var fifty;

var lr = 0.2;

var A,B,C;

function reset6() {
	exploit = [0,0,0]; explore = [0,0,0]; fifty = [0,0,0];
	A = Math.round(Math.random()*10+5);
	B = Math.round(Math.random()*10+5);
	C = Math.round(Math.random()*10+5);
}

function init6() {
	reset6();
}

var time = 0;

function run6() {
	time += elapsed();
	if (time>3000) {plot6(); }

	tick6 = requestAnimationFrame(run6);
}

////////////////////////////////
////////// END CODE /////////////
////////////////////////////////

function run(i) {	
	$("#continue").show();
	clearTimeout(to);
	cancelAnimationFrame(tick6);
	// Runs each time a block starts incase that block has to do startup
	switch(i) {
		case 2:
			if (!done2) {$("#continue").hide();run2();}
			break;
		case 4:
			if (!done4) {$("#continue").hide();launch4();}
			break;
		case 5:
			run5();
			break;
		case 6:
			run6();
			break;
	}
}



function launch_local() {
	katex.render("A=0",document.getElementById("katex1"),{displayMode:true});	
	katex.render("RPE=R-A_{v}",document.getElementById("katex2"),{displayMode:true});	
	katex.render("A_{v+1}=A_{v} + \\alpha(R-A_{v})",document.getElementById("katex3"),{displayMode:true});	
	katex.render("A_{v}=1,B_{v}=2,C_{v}=3",document.getElementById("katex6"),{displayMode:true});	
	// katex.render("P(A)=A>B \\& B>C",document.getElementById("katex6-2"),{displayMode:true});	
	katex.render("P(A)=\\dfrac{A_{v}}{A_{v}+B_{v}+C_{v}}",document.getElementById("katex6-3"),{displayMode:true});	
	$("#end4").hide();
	resetTraces5();
	init6();
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