// A dots drawing package for changing motion coherence

function initDots(n,maxx,maxy,coherent,dir) {
	var dots = {};
	dots.n = n;
	dots.minx = 0;
	dots.miny = 0;
	dots.maxx = maxx;
	dots.maxy = maxy;
	dots.x = zeros(n);
	dots.y = zeros(n);
	dots.coherent = [];
	dots.dir = dir;
	for (var i=0;i<n;i++) {
		dots.x[i] = Math.random()*dots.maxx;
		dots.y[i] = Math.random()*dots.maxy;
		dots.coherent.push(Math.random()<coherent);
	}
	return dots;
}

function updateDots(dots,coherent,dir) {
	if (typeof(dir) !== 'undefined') {dots.dir = dir;}

	for (var i=0;i<dots.n;i++) {
		dots.coherent[i] = Math.random()<coherent;
		if (dots.coherent[i]) {
			dots.x[i] += Math.cos(dots.dir);
			dots.y[i] += Math.sin(dots.dir);
		} else {
			dots.x[i] += Math.cos(Math.random()*2*Math.PI);
			dots.y[i] += Math.sin(Math.random()*2*Math.PI);
		}
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
		ctx.fillRect(Math.round(dots.x[i]),Math.round(dots.y[i]),1,1);
	}
}