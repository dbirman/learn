
var socket = io();


socket.on('login', function (success) {
	if (success) {
		console.log('login received');
		document.getElementById("login").style.display="none";
		document.getElementById("viewport").style.display="";
		launchPixi();
	}
});

socket.on('matrix', function(matrix) {updateMatrix(matrix);});

socket.on('graph', function(graph) {updateGraph(graph);});

socket.on('rates', function(rates) {updateRates(rates);});

socket.on('weights', function(weights) {lweights = weights; updateWeights();});

socket.on('login_fail', function() {alert('Failed to login');})

socket.on('play', function(active) {console.log(active); lactive = active; addPlay(lactive); });

function login(student,section,password) {
	var data = {};
	data.sectionNum = section;
	data.student = student;
	data.password = password;
	socket.emit('login',data);
}

var TA = false;

function taLogin() {
	pass = document.getElementById("password").value;
	section = Number(document.getElementById("section").value);
	
	if ((pass!=undefined) && (section!=undefined)) {
		login(false,section,pass);
		TA = true;
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
		TA = false;
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
	viewContainer = new PIXI.Container();
	app.stage.addChild(viewContainer);
	if (TA) {
		addTA(viewContainer);
	} else {
		// Student
		addNeuron(viewContainer); 
		addSynapses(viewContainer);
	}
	addPlay(lactive);
}

var playg;

function addPlay(active) {   
	if (playg!=undefined) {playg.destroy()}

	var style = new PIXI.TextStyle({
      fill: active ? 0x00FF00 : 0xFF0000,
  });
  // add electrode text
  if (active) {
  	t = new PIXI.Text('PLAYING!',style);
  } else {
  	t = new PIXI.Text('NOT PLAYING',style);
  }
  t.x = 500;
  t.y = 50;
  t.anchor.set(0.5,0.5);
  app.stage.addChild(t);

  playg = t;

}

//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////// TA CODE  ////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////

function addTA(container) {
	document.getElementById("ta_stuff").style.display="";
	// add matrix
	matContainer = new PIXI.Container();
	matContainer.visible = false;
	app.stage.addChild(matContainer);

	// add graph
	graphContainer = new PIXI.Container();
	graphContainer.visible = false;
	app.stage.addChild(graphContainer);
	
}

function taPlay() {
	if (TA) {
		socket.emit('play');
	}
}

function taReset() {
	if (TA) {
		socket.emit('reset');
	}
}

var matContainer,
		matStructure = {};

// function fakeMatrix() {
// 	matStructure.matrix = [];
// 	for (var i=0;i<18;i++) {
// 		matStructure.matrix[i] = ones(18);
// 	}
// 	drawMatrix();
// }

function updateMatrix(matrix) {
	matStructure.matrix = matrix;
	drawMatrix();
	drawGraph();
}

function drawMatrix() {
	if (matStructure.g!=undefined) {matStructure.g.destroy();}
	var g = new PIXI.Graphics();
	var m = matStructure.matrix,
		sz = 20;
	for (var i=0;i<m.length;i++) {
		for (var j=0;j<m[i].length;j++) {
			var val = m[i][j];
			val = (val + 0.25)/0.5;
			g.beginFill(PIXI.utils.rgb2hex([val,val,val]),1);
			g.drawRect(i*sz,j*sz,sz-1,sz-1);
		}
	}
	matContainer.addChild(g);
	matStructure.g = g;
}

function toggleMatrix() {
	matContainer.visible = !matContainer.visible;
	if (matContainer.visible) {
		getMatrix();
	}
}

var tickMatrix;

function getMatrix() {
	if (tickMatrix!=undefined) {
		return;
	}
	setTimeout(getMatrix,2000);
	socket.emit('matrixRequest');
}

var graphContainer,
		graphStructure = {};

function drawGraph() {
	if (graphStructure.g!=undefined) {graphStructure.g.destroy();}
	// Build the graph and connections
	var cpos = [700,300],
		rad = 15,
		bigrad = 200;
	var m = matStructure.matrix,
		xs = [],
		ys = [];
	graphStructure.students = [];

	for (var i=0;i<m.length;i++) {
		var x = cpos[0] + bigrad*Math.cos(Math.PI*2*i/m.length),
			y = cpos[1] + bigrad*Math.sin(Math.PI*2*i/m.length);
		xs.push(x);
		ys.push(y);
	}

	for (var i=0;i<m.length;i++) {
		var sg = new PIXI.Graphics();

		// draw weight lines
		var w = m[i];
		for (var j=0;j<w.length;j++) {
			if (i!=j) {
				var cw = w[j];
				cw = (cw+0.25)*2;

				sg.lineStyle(cw*5,PIXI.utils.rgb2hex([cw,cw,cw]),cw);
				sg.moveTo(xs[i],ys[i]);
				sg.lineTo(xs[j],ys[j]);
			}
		}

		sg.lineStyle(0,0,0);
		sg.beginFill(0xFFFFFF,0.5);
		sg.drawCircle(xs[i],ys[i],rad);

		graphContainer.addChild(sg);
		graphStructure.students.push(sg);
	}

}

function toggleGraph() {
	graphContainer.visible = !graphContainer.visible;
	if (graphContainer.visible) {
		getMatrix();
	}
}

//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////// STUDENT CODE  ////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////

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
		num = 20,
		pr = 0.6,
		mr = 0.5;

		for (var i=0;i<num;i++) {
			var syn = {};

			syn.theta = Math.PI*1.75-i/num*Math.PI*1.5;
			syn.num = i;
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
	if (lactive) {
		console.log('You tried to make synapse #' + num + ' more positive ' + positive);
		var syn = {};
		syn.num = num;
		syn.positive = positive;
		lweights[num] += 0.025 * (positive ? 1 : -1);
		updateWeights();
		socket.emit('synapse',syn);
	}
}

// max firing rate is 10

var rates = [], // firing rates for the 11 synapses + neuron (0->11 indexes)
	nrn_rate =0 ;

function updateRates(nRates) {
	rates = nRates.all;
	nrn_rate = nRates.me;
}

lweights = [];

function updateWeights() {
	// Change the colors of the synapse graphics to reflect the new weights
	for (var i=0;i<=16;i++) {
		var syn = synapses[i];
		syn.g.alpha = Math.max(0.05,Math.abs(lweights[i])*2);
		const graphicsData = syn.g.graphicsData;
		var color = lweights[i]>0 ? 0x00FF00 : 0xFF0000;
		for (var gi=0;gi<graphicsData.length;gi++) {
			graphicsData[gi].lineColor = color;
		}
		syn.g.dirty++;
		syn.g.clearDirty++;
	}
	for (var i=17;i<synapses.length;i++) {
		var syn = synapses[i];
		syn.g.alpha = Math.max(0.05,Math.abs(lweights[i])*(0.5/0.9));
		const graphicsData = syn.g.graphicsData;
		var color = lweights[i]>0 ? 0x00FF00 : 0xFF0000;
		for (var gi=0;gi<graphicsData.length;gi++) {
			graphicsData[gi].lineColor = color;
		}
		syn.g.dirty++;
		syn.g.clearDirty++;
	}
}

var lactive = false;

function fire() {
	setTimeout(fire,100);
	if (!lactive) {
		return;
	}
	// 
	for (var i=0;i<rates.length;i++) {
		if (Math.random()<(rates[i]/10)) {
			synapses[i].g.alpha = synapses[i].g.alpha*2;
			setTimeout(new Function('synapses['+i+'].g.alpha = synapses['+i+'].g.alpha/2;'),150);
		}
	}
	if (Math.random()<(nrn_rate/10)) {
		nrn.alpha = 1;
		setTimeout(function() {nrn.alpha = 0.5;},150);
	}

}

fire();


//// helpers


/**
 * Function to make array of zeros of given length.
 * @param {Number} length the length of the array to make
 * @returns {Array} the zero array
 */
function zeros(length) {
	var tempArray = new Array(length);
	for (var i=0;i<tempArray.length;i++) {
		tempArray[i] = 0;
	}
	return tempArray;
}

/**
 * Function to make array of ones of given length.
 * @param {Number} length the length of the array to make.
 * @returns {Array} the ones array
 */
function ones(length) {
	var tempArray = new Array(length);
	for (var i=0;i<length;i++) {
		tempArray[i] = 1;
	}
	return tempArray;
}
