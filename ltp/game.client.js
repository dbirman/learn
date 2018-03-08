
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

// socket.on('graph', function(graph) {updateGraph(graph);});
socket.on('lgn_fr', function(lgn_fr) {setLGN_FR(lgn_fr);})
socket.on('orient', function(theta) {updateTheta(theta);});
socket.on('AIon', function(ai) {updateAI(ai);});
socket.on('stimon', function(stim) {updateStim(stim);});

socket.on('rates', function(rates) {updateRates(rates);});

socket.on('weights', function(weights) {
	lweights = weights;
	updateWeights();
	computeOrientationFunction();
	drawOrientation();
});

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
	initTheta();
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

function updateAI(ai) {
	if (TA) {
		if (ai) {
			document.getElementById("aibutton").innerHTML = "Turn off AI";
		} else {
			document.getElementById("aibutton").innerHTML = "Turn on AI";
		}
	} else {

	}
}

function updateStim(stim) {
	if (TA) {
		if (stim) {
			document.getElementById("stimbutton").innerHTML = "Hide stimulus";
		} else {
			document.getElementById("aibutton").innerHTML("Show stimulus");
		}
	} else {

	}
}

function drawOrientation() {
	if (TA) {
		drawOrientationTA();
	} else {
		drawOrientationStudent();
	}
}

var theta;

function initTheta() {
	theta = {};
	if (TA) {
		theta.pos = [400,200];
	} else {
		theta.pos = [0,0];
	}

	if (theta.gLGN!=undefined) {theta.gLGN.destroy();}
	theta.lgn = [];
	// draw the LGN neurons (the firing rate code will make them fire)
	theta.gLGN = new PIXI.Container();
	theta.gLGN.x = theta.pos[0] + 100; theta.gLGN.y = theta.pos[1] + 100;
	for (var i=0;i<nLGN;i++) {
		// range is -5 to 5, so use that compute position in the 200 matrix (*20 basically)
		g = new PIXI.Graphics();
		g.beginFill(0xFFFFFF,0.5);
		g.drawCircle(lgnpos[i][0]*20,lgnpos[i][1]*20,5);

		theta.gLGN.addChild(g);
		theta.lgn.push(g);
	}
}

function updateTheta(cOrient) {
	clgn_fr = lgn_fr[cOrient];
	if (thetaContainer!=undefined) {thetaContainer.destroy();}
	thetaContainer = new PIXI.Container();
	app.stage.addChild(thetaContainer);

	var nTheta = orientations[cOrient]

	if (theta.g!=undefined) {theta.g.destroy();}

	// draw a black box
	theta.g = new PIXI.Graphics();
	theta.g.beginFill(0x000000,1);
	theta.g.drawRect(theta.pos[0],theta.pos[1],200,200);
	thetaContainer.addChild(theta.g);

	if (theta.gBar!=undefined) {theta.gBar.destroy();}
	// draw an oriented bar
	theta.gBar = new PIXI.Graphics();
	theta.gBar.x = theta.pos[0] + 100; theta.gBar.y = theta.pos[1] + 100;
	theta.gBar.beginFill(0xFFFFFF,0.25);
	theta.gBar.drawRect(-100,-10,200,20);
	theta.gBar.pivot = new PIXI.Point(0,0);
	theta.gBar.rotation = -nTheta+Math.PI/2;
	thetaContainer.addChild(theta.gBar);

	// draw all of the actual nodes
	thetaContainer.addChild(theta.gLGN);

}

var lgn_fr, nLGN, lgnpos, clgn_fr, orientations, thetaContainer;

function setLGN_FR(orient) {
	orientations = orient.orientations;
	nLGN = orient.lgn_pos.length;
	lgnpos = orient.lgn_pos;
	lgn_fr = orient.lgn_fr;
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
	// graphContainer = new PIXI.Container();
	// graphContainer.visible = false;
	// app.stage.addChild(graphContainer);
	
	// add Orientation functions
	var orientContainer = new PIXI.Container();
	app.stage.addChild(orientContainer);
}

var orients;

function drawOrientationTA() {
	if (TA) {

	}
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

function taAI() {
	if (TA) {
		socket.emit('toggle_ai');
	}
}

function taHideStimulus() {
	if (TA) {
		socket.emit('toggle_stim');
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
	// if (!graphInit) {initGraph();}
	// drawGraph();
}

function drawMatrix() {
	if (matStructure.g!=undefined) {matStructure.g.destroy();}
	var g = new PIXI.Graphics();
	var m = matStructure.matrix,
		sz = 20;
	for (var i=0;i<m.length;i++) {
		for (var j=0;j<m[i].length;j++) {
			var val = m[i][j];
			var color = (val + 0.25)/0.5;
			if (val>0) {
				g.beginFill(PIXI.utils.rgb2hex([0,val,0]),1);
			} else {
				g.beginFill(PIXI.utils.rgb2hex([val,0,0]),1);
			}
			g.drawRect(j*sz,i*sz,sz-1,sz-1);
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

// var graphContainer,
// 		graphStructure = {},
// 		graphInit = false;


// function initGraph() {
// 	graphInit = true;

// 	// Build the graph and connections
// 	var cpos = [700,300],
// 		rad = 15,
// 		bigrad = 200;
// 	var m = matStructure.matrix,
// 		xs = [],
// 		ys = [];
// 	graphStructure.students = [];

// 	for (var i=0;i<m.length;i++) {
// 		var x = cpos[0] + bigrad*Math.cos(Math.PI*2*i/m.length),
// 			y = cpos[1] + bigrad*Math.sin(Math.PI*2*i/m.length);
// 		xs.push(x);
// 		ys.push(y);
// 	}

// 	graphStructure.xs = xs;
// 	graphStructure.ys = ys;
// 	graphStructure.rad = rad;
// 	graphStructure.bigrad = bigrad;
// 	graphStructure.cpos = cpos;

// 	for (var i=0;i<m.length;i++) {
// 		var snode = new PIXI.Graphics();

// 		snode.lineStyle(0,0,0);
// 		snode.beginFill(0xFFFFFF,1);
// 		snode.drawCircle(xs[i],ys[i],rad);
// 		snode.alpha = 0.5;
// 		console.log(snode.alpha);
// 		graphContainer.addChild(snode);
// 		graphStructure.students.push(snode);

// 	}
// }

// function drawGraph() {
// 	if (graphStructure.g!=undefined) {graphStructure.g.destroy();}
// 	// Build the graph and connections
// 	var cpos = graphStructure.cpos,
// 		rad = graphStructure.rad,
// 		bigrad = graphStructure.bigrad,
// 		m = matStructure.matrix,
// 		xs = graphStructure.xs,
// 		ys = graphStructure.ys;

// 	for (var i=0;i<m.length;i++) {
// 		var sg = new PIXI.Graphics();

// 		// draw weight lines
// 		var w = m[i];
// 		for (var j=0;j<w.length;j++) {
// 			if (i!=j) {
// 				var cw = w[j];
// 				cw = Math.pow((cw+0.25)*2,2);

// 				sg.lineStyle(cw*5,PIXI.utils.rgb2hex([cw,cw,cw]),cw);
// 				sg.moveTo(xs[i],ys[i]);
// 				sg.lineTo(xs[j],ys[j]);
// 			}
// 		}
// 		graphContainer.addChild(sg);
// 		graphStructure.g = sg;
// 	}
// }

// function toggleGraph() {
// 	graphContainer.visible = !graphContainer.visible;
// 	if (graphContainer.visible) {
// 		getMatrix();
// 	}
// }

//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////// STUDENT CODE  ////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////

function drawOrientationStudent() {

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
	num = 16,
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

		// if (i<=16) {
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
		// }

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
	// rates = nRates.all;
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
	// show lgn firing on the stimulus screen if stimulus is enabled
	//[TODO]
	if (clgn_fr!=undefined) {
		for (var i=0;i<clgn_fr.length;i++) {
			if (Math.random()<(clgn_fr[i]/10)) {
				theta.lgn[i].alpha = theta.lgn[i].alpha*2;
				setTimeout(new Function('theta.lgn['+i+'].alpha = theta.lgn['+i+'].alpha/2;'),150);
			}
		}
	}

	if (TA) {
		// no differences
	} else {
		if (clgn_fr!=undefined) {
			for (var i=0;i<clgn_fr.length;i++) {
				if (Math.random()<(clgn_fr[i]/10)) {
					synapses[i].g.alpha = synapses[i].g.alpha*2;
					setTimeout(new Function('synapses['+i+'].g.alpha = synapses['+i+'].g.alpha/2;'),150);
				}
			}
		}
		if (Math.random()<(nrn_rate/10)) {
			nrn.alpha = 1;
			setTimeout(function() {nrn.alpha = 0.5;},150);
		}
	}

}

fire();

// Multiply the weight matrix by the canonical orientation map 
// to compute 
function computeOrientationFunction() {
	if (TA) {

	} else {

	}
}


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

function sum(array) {
	var csum = 0;
	for (var ai=0;ai<array.length;ai++) {
		csum+= array[ai];
	}
	return csum;
}