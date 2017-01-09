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