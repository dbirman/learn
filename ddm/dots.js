// A dots drawing package for changing motion coherence

function initDots(n,maxx,maxy,coherent,dir,spd,sz) {
	if (arguments.length < 7) {
		throw new Error('Not enough arguments for initDots()');
	}
	var dots = {};
	dots.n = n;
	dots.minx = 0;
	dots.miny = 0;
	dots.maxx = maxx;
	dots.maxy = maxy;
	dots.x = zeros(n);
	dots.y = zeros(n);
	dots.coherent = [];
	dots.speed = spd;
	dots.size = sz;
	dots.szoff = Math.floor(dots.size/2);
	dots.dir = dir;
	for (var i=0;i<n;i++) {
		dots.x[i] = Math.random()*dots.maxx;
		dots.y[i] = Math.random()*dots.maxy;
		dots.coherent.push(Math.random()<coherent);
	}
	if (!((dots.size % 2)==1)) {
		console.log('Dot size must be odd');
	}
	return dots;
}

function updateDots(dots,coherent,dir,elapsed) {
	if (typeof(dir) !== 'undefined') {dots.dir = dir;}

	for (var i=0;i<dots.n;i++) {
		dots.coherent[i] = Math.random()<coherent;
		var xs, ys;
		if (dots.coherent[i]) {
			xs = Math.cos(dots.dir);
			ys = Math.sin(dots.dir);
		} else {
			xs = Math.cos(Math.random()*2*Math.PI);
			ys = Math.sin(Math.random()*2*Math.PI);
		}
		dots.x[i] += xs*dots.speed*elapsed;
		dots.y[i] += ys*dots.speed*elapsed;
		if (dots.x[i]>dots.maxx) {dots.x[i] -= dots.maxx;}
		if (dots.y[i]>dots.maxy) {dots.y[i] -= dots.maxy;}
		if (dots.x[i]<0) {dots.x[i] += dots.maxx;}
		if (dots.x[i]<0) {dots.y[i] += dots.maxy;}
	}
	return dots;
}

function drawDots(dots,ctx) {
	ctx.fillStyle = "#ffffff";
	for (var i=0;i<dots.n;i++) {
		ctx.fillRect(Math.round(dots.x[i])-dots.szoff,Math.round(dots.y[i])-dots.szoff,dots.size,dots.size);
	}
}

function clipCtx(ctx,canvas) {
	ctx.save();
	ctx.beginPath();
	ctx.arc(canvas.width/2,canvas.height/2,canvas.width/2,0,2*Math.PI,false);
	ctx.clip();
}

/*

// example code

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var coherence = 0.65;
var dots = initDots(100,100,100,coherence2,0,0.075,1);
var tick;
var ptime = 0;

function drawDots() {
	var el = Date.now()-ptime; ptime = Date.now();

	dots = updateDots(dots,coherence,dots.dir,el);
	// draw
	ctx.clearRect(0,0,canvas.width,canvas.height);
	clipCtx(ctx,canvas);
	drawDots(dots,ctx);
	ctx.restore();

	tick = window.requestAnimationFrame(drawDots);
}
*/