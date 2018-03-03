
var socket = io();


socket.on('login', function (success) {
	if (success) {
		console.log('login received');
		document.getElementById("login").style.display="none";
		document.getElementById("viewport").style.display="";
		launchPixi();
	}
});

function login(student,section,password) {
	var data = {};
	data.sectionNum = section;
	data.student = student;
	data.password = password;
	socket.emit('login',data);
}

var TA;

function taLogin() {
	pass = document.getElementById("password").value;
	section = Number(document.getElementById("section").value);
	
	if ((pass!=undefined) && (section!=undefined)) {
		login(false,section,pass);
		TA = false;
	}
}

function studentLogin() {
	section = Number(document.getElementById("section").value);

	if (section<2 || section>13) {
		alert('That is not your section number. This incident will be reported. See https://xkcd.com/838/');
		return;
	}

	if (section!=undefined) {
		login(true,section,'');
	}
}

var rendererOptions = {
  antialiasing: false,
  transparent: true,
  resolution: window.devicePixelRatio,
  autoResize: true,
}

var ORIGIN_WIDTH = 1000, ORIGIN_HEIGHT = 800;
const app = new PIXI.Application(ORIGIN_WIDTH,ORIGIN_HEIGHT, rendererOptions);
var graphics = [];

// The application will create a canvas element for you that you
// can then insert into the DOM
document.getElementById("viewport").appendChild(app.view);

function launchPixi() {
	if (TA) {

	} else {
		// Student
	    viewContainer = new PIXI.Container();
	    app.stage.addChild(viewContainer);

		addNeuron(viewContainer); 
		addSynapses(viewContainer);
	}
}

var nrn;

function addNeuron(container) {
    nrn = PIXI.Sprite.fromImage('images/nrn.png');
	nrn.anchor.set(0.5,0.5);
	nrn.scale.set(0.4);
	nrn.x = 600; nrn.y = ORIGIN_HEIGHT/2;
	nrn.alpha = 0.5;
	container.addChild(nrn);
}

var synapses = [];

function addSynapses(container) {
	// Adds the eleven incoming synapses that can be up/down weighted

	var lpos = [450,ORIGIN_HEIGHT/2], // approx left side of the neuron
		irad = 400, // radius to bring synapses in from
		inr = 0.4,
		num = 11,
		pr = 0.6,
		mr = 0.5;

	for (var i=0;i<num;i++) {
		var syn = {};

		syn.theta = Math.PI*1.5-i/num*Math.PI;
		syn.num = 1*i;
		syn.posCall = new Function('synapseCallback('+syn.num+',true)');
		syn.negCall = new Function('synapseCallback('+syn.num+',false)');

		// Find two sets of points -- one set far away, and one set closer.
		var ic = Math.cos(syn.theta),
			is = Math.sin(syn.theta);

		var fx = lpos[0] + irad*ic,
			fy = lpos[1] + irad*is,
			nx = lpos[0] + inr*irad*ic,
			ny = lpos[1] + inr*irad*is;
			tx1 = lpos[0] + (inr-0.05)*irad*Math.cos(syn.theta-Math.PI/30),
			ty1 = lpos[1] + (inr-0.05)*irad*Math.sin(syn.theta-Math.PI/30),
			tx2 = lpos[0] + (inr-0.05)*irad*Math.cos(syn.theta+Math.PI/30),
			ty2 = lpos[1] + (inr-0.05)*irad*Math.sin(syn.theta+Math.PI/30);

		var spx = lpos[0] + pr*irad*ic,
			spy = lpos[1] + pr*irad*is;
			smx = lpos[0] + mr*irad*ic,
			smy = lpos[1] + mr*irad*is;

		// Draw a line between the two sets of points
		syn.g = new PIXI.Graphics();    
		syn.g.lineStyle(5,0xFFFFFF,1);
		syn.g.moveTo(fx,fy);
		syn.g.lineTo(nx,ny);

		// Add the tip
		syn.g.lineTo(tx1,ty1);
		syn.g.moveTo(nx,ny);
		syn.g.lineTo(tx2,ty2);

		syn.g.alpha = 0.5;

		container.addChild(syn.g);

		syn.plus = PIXI.Sprite.fromImage('images/plus-01.png');
		syn.plus.anchor.set(0.5,0.5);
		syn.plus.scale.set(0.75);
		syn.plus.x = spx; syn.plus.y = spy;
		syn.plus.interactive = true;
    	syn.plus.on('pointerdown', syn.posCall);
		container.addChild(syn.plus);

		syn.minus = PIXI.Sprite.fromImage('images/minus-01.png');
		syn.minus.anchor.set(0.5,0.5);
		syn.minus.scale.set(0.75);
		syn.minus.x = smx; syn.minus.y = smy;
		syn.minus.interactive = true;
    	syn.minus.on('pointerdown', syn.negCall);
		container.addChild(syn.minus);

		synapses.push(syn);
	}
}

function synapseCallback(num,positive) {
	console.log('You tried to make synapse #' + num + ' more positive ' + positive);
}

// max firing rate is 10

var rates = [1,2,3,4,1,6,4,3,5,6,2,5]; // firing rates for the 11 synapses + neuron (0->11 indexes)

function updateRates(nRates) {

}

function fire() {
	// 
	for (var i=0;i<(rates.length-1);i++) {
		if (Math.random()<(rates[i]/10)) {
			synapses[i].g.alpha = 1;
			setTimeout(new Function('synapses['+i+'].g.alpha = 0.5;'),50);
		}
	}
	if (Math.random()<(rates[11]/10)) {
		nrn.alpha = 1;
		setTimeout(function() {nrn.alpha = 0.5;},50);
	}

	setTimeout(fire,100);
}