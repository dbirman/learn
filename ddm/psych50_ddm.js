
////////////////////////////////
////////// BLOCK 2 /////////////
////////////////////////////////

////////////////////////////////
////////// INPUTS! /////////////
////////////////////////////////

// this is the worst fucking code I've written anywhere in this
// entire project.

// sorry next person

var low = {};
var high = {}; 
low.rt = 0; high.rt = 0;
low.correct =0; high.correct=0;

function input2lcc(e,val) {
	var key = e.which;
	if (key===13) {
		e.preventDefault();
		num = parseInt(val);
		if (num>100) {
			alert('Value was too large! Should be between 0-100');
			return
		}
		else if (num<0) {
			alert('Number was too small! Should be between 0-100');
			return
		}
		low.correct = num
		document.getElementById("lcc").innerHTML = "Low coherence % correct = " + low.correct + "%";
		
	}
}
function input2hcc(e,val) {
	var key = e.which;
	if (key===13) {
		e.preventDefault();
		num = parseInt(val);
		if (num>100) {
			alert('Value was too large! Should be between 0-100');
			return
		}
		else if (num<0) {
			alert('Number was too small! Should be between 0-100');
			return
		}
		high.correct = num;
		document.getElementById("hcc").innerHTML = "High coherence % correct = " + high.correct + "%";

	}
}
function input2lcrt(e,val) {
	var key = e.which;
	if (key===13) {
		e.preventDefault();
		num = parseInt(val);
		if (num>5000) {
			alert('Value was too large! Should be between 100-5000');
			return
		}
		else if (num<100) {
			alert('Number was too small! Should be between 100-5000');
			return
		}
		low.RT = num;
		document.getElementById("lcrt").innerHTML = "Low coherence reaction time = " + low.RT + " ms";

	}
}
function input2hcrt(e,val) {
	var key = e.which;
	if (key===13) {
		e.preventDefault();
		num = parseInt(val);
		if (num>5000) {
			alert('Value was too large! Should be between 100-5000');
			return
		}
		else if (num<100) {
			alert('Number was too small! Should be between 100-5000');
			return
		}
		high.RT = num;
		document.getElementById("hcrt").innerHTML = "High coherence reaction time = " + high.RT + " ms";

	}
}

function allEntered() {
	if (low.correct && high.correct && low.RT && high.RT) {
		$("#ina").hide();
		$("#inb").hide();
		$("#inc").hide();
		$("#ind").hide();
		return true;
	}
	return false
}

// block 2 steps through the DDM
var cur2 = 0;
var max2 = 5;
function init2() {
	for (var i=1;i<=max2;i++) {
		$("#b2_p"+i).hide();
	}
	$("#b2_always").hide();
}

function step2() {
	$("body").scrollTop(0);
	stop2();
	
	// HIDE PARAMETERS
	$("#b2_diff").hide();
	$("#b2_drift").hide();

	if (cur2==0) {
		if (!allEntered()) {alert('Enter all the information.'); return;}
	}
	if (cur2<max2) {
		console.log('next');
		$("#b2_p"+cur2).hide();
		cur2+=1;
		$("#b2_p"+cur2).show();
	}
	else {
		$("#step2").hide();
		$("#b2_p"+max2).hide();
		$("#dataentry").hide();
		next();
	}
	switch (cur2) {
		case 1:
			$("#b2_always").show();
			elapsed();
			drawDots2();
			break;
		case 2:
			$("#b2_always").show();
			$("#b2_diff").show();
			elapsed();
			drawDots2();
			run_2();
			break;
		case 3:
			$("#b2_always").show();
			$("#b2_diff").show();
			elapsed();
			drawDots2();
			run_2();
			plot_bounds = true;
			break;
		case 4:
			$("#b2_always").show();
			$("#b2_diff").show();
			$("#b2_drift").show();
			elapsed();
			drawDots2();
			break;
		case 5:
			$("#b2_always").hide();
			$("#step2").hide();
			break;
		default:
			$("#b2_always").hide();
	}
}

var canvas2 = document.getElementById("canvas_b2");
var ctx2 = canvas2.getContext("2d");
var coherence2 = 0.65;
var dots2 = initDots(100,100,100,coherence2,0,0.075,1);
var tick2;

var plot_bounds = false;

function stop2() {
	window.cancelAnimationFrame(tick2);
}
function drawDots2() {
	var el = elapsed();
	dots2 = updateDots(dots2,coherence2,dots2.dir,el);
	// draw
	ctx2.clearRect(0,0,canvas2.width,canvas2.height);
	clipCtx(ctx2,canvas2);
	drawDots(dots2,ctx2);
	ctx2.restore();

	plot2a_always();
	switch (cur2) {
		case 1:
			upd_1(); break;
		case 2:
			upd_2(); break;
		case 3:
			upd_2(); break;
		case 4:
			upd_4();
			run_4(el);
			break;
	}

	tick2 = window.requestAnimationFrame(drawDots2);
}

// Code for continuing after break
var keys = [68,82,73,70,84];
var sofar = 0;
function continue2(event) {
	if (event.which==keys[sofar]) {
		sofar++;
	} else {
		sofar=0;
	}
	if (sofar==5) {$("#step2").show();}
}

function flip2() {dots2.dir = dots2.dir>0?0:Math.PI; drawPlot2();}
// function updateCoherence2(ncoh) {coherence2 = ncoh; document.getElementById("coherence2").innerHTML=Math.round(ncoh*100)+"%";}
var option = 1;
function toggleCoherence() {
	coherence2 = (coherence2+0.5) % 1;
	option = (option+1)%2;
	if (option==1) {
		document.getElementById("toggle").innerHTML = "High coherence";
	} else {
		document.getElementById("toggle").innerHTML = "Low coherence";
	}
}
var diff2 = 1;
function updateDiffusion2(diff) {cvals = [0]; diff2 = Number(diff); $("#diffusion2").html("Diffusion rate = " + diff2); run_2();}
var drift2 = 1;
function updateDrift2(drift) {cvals = [0]; drift2 = Number(drift); $("#drift2").html("Drift rate = " + drift2);};
var canvas2a = document.getElementById("canvas_b2_a");
var ctx2a = canvas2a.getContext("2d");

function plot2a_always() {
	ctx2a.clearRect(0,0,canvas2a.width,canvas2a.height);
	// plot the axis
	ctx2a.strokeStyle = "#ffffff";
	ctx2a.beginPath();
	ctx2a.moveTo(0,0);
	ctx2a.lineTo(0,200);
	ctx2a.stroke();
	ctx2a.beginPath();
	ctx2a.moveTo(0,100);
	ctx2a.lineTo(400,100);
	ctx2a.stroke();
	ctx2a.fillStyle = "#ffffff";
	ctx2a.font = "18px Arial";
	ctx2a.fillText("Time (ms)",300,118);
	ctx2a.fillText("Evidence for right",5,15);
	ctx2a.fillText("Evidence for left",5,195);

	ctx2a.strokeStyle = "#CD6155";
	ctx2a.beginPath(); ctx2a.moveTo(0,100-cvals[0]);
	for (var i=1;i<cvals.length;i++) {
		ctx2a.lineTo(i,100-cvals[i]);
	}
	ctx2a.stroke();

	// reset if far past zero or 100
	if (cvals[cvals.length-1] > 130 || cvals[cvals.length-1]<-130) {cvals=[0];}

	if (counter_2<400) {
		counter_2++;
	} else {
		cvals = [0]; counter_2=0;
	}

	if (plot_bounds) {
		ctx2a.strokeStyle = "#ffffff";
		ctx2a.beginPath();
		ctx2a.moveTo(0,0);
		ctx2a.lineTo(400,0);
		ctx2a.stroke();
		ctx2a.beginPath();
		ctx2a.moveTo(0,199);
		ctx2a.lineTo(400,199);
		ctx2a.stroke();
	}
}

var counter_2 = 0,
	cvals = [0];

function upd_1() {
	// Draw motion evidence accumulated over time
	// just go out to 2000 ms, then die off
	var f = (dots2.dir>0) ? -1 : 1;
	cvals.push(cvals[cvals.length-1]+coherence2*f);
}

function upd_2() {
	var f = (dots2.dir>0) ? -1*diff2: 1*diff2;
	cvals.push(cvals[cvals.length-1]+coherence2*f);
}

function upd_4() {
	var f = (dots2.dir>0) ? -1*diff2: 1*diff2;
	cvals.push(cvals[cvals.length-1]+coherence2*f+randn()*drift2);
}

function run_2() {
	// Run the actual model, to generate model estimates for
	// this parameter set
	// average reaction time under the assumption of boundary = 100
	var high_rt = 100 / (.65*diff2);
	var low_rt = 100 / (.15*diff2);

	$("#hcrt").html("High coherence reaction time = " + 
		high.RT + " ms " + "<span style=\"color:#CD6155\">model = " + 
		Math.round(high_rt) + " ms</span>");
	$("#lcrt").html("Low coherence reaction time = " + 
		low.RT + " ms "  + "<span style=\"color:#CD6155\">model = " + 
		Math.round(low_rt) + " ms</span>");
}

var el4 = 0;

function run_4(e) {
	el4+=e;
	if (el4<1000) {return}
	el4=0;
	// Simulate it? Really?
	var high_rt = 0;
	var low_rt = 0;

	var high_pc = 0;
	var low_pc = 0;
	var reps = 50;

	var hcv, lcv;
	for (var i=0; i<reps;i++) {
		hcv = 0; lcv = 0;
		for (var j=0; j<1000;j++) {
			hcv = hcv + .65 * diff2 + randn() * drift2;
			if (hcv >= 100) {high_pc++; high_rt+=j; break};
		}
		for (var j=0; j<1000;j++) {
			lcv = lcv + .15 * diff2 + randn() * drift2;
			if (lcv >= 100) {low_pc++; low_rt+=j; break};
		}
	}

	high_pc = high_pc / reps;
	low_pc = low_pc / reps;

	high_rt = high_rt / reps;
	low_rt = low_rt / reps;

	$("#hcc").html("High coherence % correct = " +
		high.correct + "% " + "<span style=\"color:#CD6155\">model = " +
		Math.round(high_pc*100) + "%</span>");		

	$("#lcc").html("Low coherence % correct = " +
		low.correct + "% " + "<span style=\"color:#CD6155\">model = " +
		Math.round(low_pc*100) + "%</span>");

	$("#hcrt").html("High coherence reaction time = " + 
		high.RT + " ms " + "<span style=\"color:#CD6155\">model = " + 
		Math.round(high_rt) + " ms</span>");
	$("#lcrt").html("Low coherence reaction time = " + 
		low.RT + " ms "  + "<span style=\"color:#CD6155\">model = " + 
		Math.round(low_rt) + " ms</span>");
}

////////////////////////////////
////////// BLOCK 3 /////////////
////////////////////////////////

var canvas_25 = document.getElementById("canvas_mot25");
var ctx_25 = canvas_25.getContext("2d");
var canvas_50 = document.getElementById("canvas_mot50");
var ctx_50 = canvas_50.getContext("2d");
// var canvas_75 = document.getElementById("canvas_mot75");
// var ctx_75 = canvas_75.getContext("2d");

var dots25 = initDots(100,100,100,0.15,0,0.075,1);
var dots50 = initDots(100,100,100,0.65,0,0.075,1);
// var dots75 = initDots(100,100,100,0.75,0,0.075,1);
var tick3;

function drawMotionPatches() {
	var el = elapsed();
	ctx_25.clearRect(0,0,canvas_25.width,canvas_25.height);
	ctx_50.clearRect(0,0,canvas_50.width,canvas_50.height);
	// ctx_75.clearRect(0,0,canvas_75.width,canvas_75.height);
	dots25 = updateDots(dots25,0.15,0,el);
	dots50 = updateDots(dots50,0.65,0,el);
	// dots75 = updateDots(dots75,0.75,0,el);
	clipCtx(ctx_25,canvas_25);
	clipCtx(ctx_50,canvas_50);
	// clipCtx(ctx_75,canvas_75);
	drawDots(dots25,ctx_25);
	drawDots(dots50,ctx_50);
	// drawDots(dots75,ctx_75);
	ctx_25.restore();
	ctx_50.restore();
	// ctx_75.restore();
	tick3 = window.requestAnimationFrame(drawMotionPatches);
}

////////////////////////////////
////////// BLOCK 4 /////////////
////////////////////////////////
var canvas_patch1 = document.getElementById("motion_patch1");
var output1 = document.getElementById("output1");
var ctx_patch1 = canvas_patch1.getContext("2d");
var ctx_output1 = output1.getContext("2d");

var tick4;

var time4 = 0;
var dots4 = initDots(400,100,100,0,0,0.075,1);

var outL = zeros(200);
var outR = zeros(200);
var indiv = zeros(4);
indiv[0] = zeros(200);
indiv[1] = zeros(200);
indiv[2] = zeros(200);
indiv[3] = zeros(200);

var coherence4 = 0.25;
var dir4 = 0;
var dir4f = 1;

var displayMode = 0; //0 = initial, 1 = population (noise), 2 = left + right

function continue4() {
	if (displayMode<2) {
		displayMode+=1;
		switch (displayMode) {
			case 1:
				$("#4initial").hide(); $("#4initial_div").hide();
				$("#4population").show(); $("#4population_div").show();
				break;
			case 2:
				$("#4population").hide(); $("#4population_div").hide();
				$("#4lr").show(); $("#4lr_div").show();
				$("#continue4").hide();
				// $("#continue").show();
				break;
		}
	}
}

// Code for continuing after break
var keys4 = [77,65,78,89,78,69,85,82,79,78,83];
var sofar4 = 0;
function end4(event) {
	if (event.which==keys4[sofar4]) {
		sofar4++;
		console.log('got');
	} else {
		sofar4=0;
	}
	if (sofar4==keys4.length) {$("#continue").show();}
}


function flip4() {dir4 += Math.PI;dir4f *= -1;}
function updateCoherence4(ncoh) {coherence4 = ncoh; document.getElementById("coherence4").innerHTML=Math.round(ncoh*100)+"%";}

function drawMotionDemo() {
	var el = elapsed();
	ctx_patch1.clearRect(0,0,canvas_patch1.width,canvas_patch1.height);
	ctx_output1.clearRect(0,0,output1.width,output1.height);

	// compute time, direction, and coherence
	time4 += 0.01; // we'll use a sine wave to compute the coherence
	var noise = 0.2; // use to generate DDM 
	// update
	dots4 = updateDots(dots4,Math.abs(coherence4),dir4,el);
	// draw dots
	clipCtx(ctx_patch1,canvas_patch1);
	drawDots(dots4,ctx_patch1)
	ctx_patch1.restore();

	if (displayMode==0) {
		var mult = 30;
		outL.shift();
		var resp = (dir4f<0) ? coherence4 * mult : -coherence4*mult/5;
		resp = resp + randn()*mult/2;
		outL.push(resp);
		ctx_output1.strokeStyle = "#5DADE2";
		ctx_output1.beginPath();
		ctx_output1.moveTo(0,output1.height-outL[0]-20);
		for (var i=1;i<200;i++) {
			ctx_output1.lineTo(i,output1.height-outL[i]-20);
		}
		ctx_output1.stroke();
	} else if (displayMode==1) {
		var mult = 30;
		var resp3 = zeros(4);
		for (var i=0;i<4;i++) {
			indiv[i].shift(); 
			var resp = (dir4f<0) ? coherence4 * mult : -coherence4*mult/5;
			resp = resp + randn()*mult/2;
			indiv[i].push(resp);
			resp3[i] = resp;
			ctx_output1.strokeStyle = "rgba(128,128,128,0.5)";
			ctx_output1.beginPath();
			ctx_output1.moveTo(0,output1.height-indiv[i][0]-20);
			for (var j=1;j<200;j++) {
				ctx_output1.lineTo(j,output1.height-indiv[i][j]-20);
			}
			ctx_output1.stroke();
		}
		outL.shift();
		outL.push(mean(resp3));
		ctx_output1.strokeStyle = "#5DADE2";
		ctx_output1.beginPath();
		ctx_output1.moveTo(0,output1.height-20);
		for (var i=0;i<200;i++) {
			ctx_output1.lineTo(i,output1.height-outL[i]-20);
		}
		ctx_output1.stroke();
	} else {
	// draw DDM output
	var mult = 30;
	outL.shift();
	var resp = (dir4f<0) ? coherence4 * mult : -coherence4*mult/5;
	resp = resp + randn()*mult/4;
	outL.push(resp);
	ctx_output1.strokeStyle = "#5DADE2";
	ctx_output1.beginPath();
	ctx_output1.moveTo(0,output1.height-20);
	for (var i=0;i<200;i++) {
		ctx_output1.lineTo(i,output1.height-outL[i]-20);
	}
	ctx_output1.stroke();
	// out right
	outR.shift();
	var resp = (dir4f>0) ? coherence4 * mult : -coherence4*mult/5;
	resp = resp + randn()*mult/4;
	outR.push(resp);
	ctx_output1.strokeStyle = "#CD6155";
	ctx_output1.beginPath();
	ctx_output1.moveTo(0,output1.height-20);
	for (var i=0;i<400;i++) {
		ctx_output1.lineTo(i,output1.height-outR[i]-20);
	}
	ctx_output1.stroke();
	}

	tick4 = window.requestAnimationFrame(drawMotionDemo);
}

////////////////////////////////
////////// BLOCK 5 /////////////
////////////////////////////////

// This is the sample block, before they build up the model themselves
var canvas_sample = document.getElementById("sample");
var ctx_sample = canvas_sample.getContext("2d");

var tick5;

var dots5 = initDots(400,100,100,0,0,0.075,1);
var coherence5 = 0.75;
var dir5 = 0;

function flip5() {dots5.dir = dots5.dir>0?0:Math.PI; drawPlot2();}
function updateCoherence5(ncoh) {coherence5 = ncoh; document.getElementById("coherence5").innerHTML=Math.round(ncoh*100)+"%"; drawPlot2();}


function drawMotionSample() {
	var el = elapsed();
	dots5 = updateDots(dots5,coherence5,dots5.dir,el);
	// draw
	ctx_sample.clearRect(0,0,canvas_sample.width,canvas_sample.height);
	clipCtx(ctx_sample,canvas_sample);
	drawDots(dots5,ctx_sample);
	ctx_sample.restore();

	tick5 = window.requestAnimationFrame(drawMotionSample);
}

function buildPlot2() {
	var mult = 1.5; // response multiplier (coherence>0) ? (coherence + randn() * noise)*mult : randn()*noise*mult
	var noise = 0.5;
	var data = {};
	// build up the variables for the plot
	// the evidence runs are just the L/R evidence 
	data.eL = [0]; // evidence left
	data.eR = [0];
	data.E = [0]; // accumulated evidence
	data.time = range(1,40);
	for (var i=1; i<40; i++) {
		var r = (Math.round(dots5.dir)==0) ? (coherence5 + randn() * noise)*mult : randn()*noise*mult;
		r = r>0?r:0;
		var l = (!(Math.round(dots5.dir)==0)) ? (coherence5 + randn() * noise)*mult : randn()*noise*mult;
		l = l>0?l:0;
		var E = l-r;
		data.eL.push(l);
		data.eR.push(-r);
		data.E.push(data.E[i-1]+E);
	}
	return data;
}

function drawPlot2() {
	var data2 = buildPlot2();
	traceL = {
		x: data2.time,
		y: data2.eL,
		mode:'line',
		line:{color:'blue'},
		type:'scatter',
		name:'Left population response'
	}
	traceR = {
		x: data2.time,
		y: data2.eR,
		mode:'line',
		line:{color:'red'},
		type:'scatter',
		name:'Right population response'
	}
	traceM = {
		x: data2.time,
		y: data2.E,
		mode:'line',
		marker: {color:'black'},
		type:'scatter',
		name:'Accumulated evidence (left - right)'
	}
	var layout2 = layout;
	layout2.title = 'Accumulated evidence';
	layout2.xaxis.title = 'Time (ms)';
	layout2.xaxis.range = [0,40];
	layout2.yaxis.title = 'Evidence for RIGHT --------- Evidence for LEFT';
	layout2.yaxis.range = [-25,25];
	layout2.width = 700;
	layout2.height = 400;
	Plotly.newPlot('plot2',[traceL,traceR, traceM],layout2);
}

////////////////////////////////
////////// BLOCK 6 /////////////
////////////////////////////////

var out;
var outputArea = document.getElementById("output6");
var outputArea2 = document.getElementById("output62");

var coh6 = Math.random();
var dir6 = (Math.random()>0.5) ? 1 : -1;

$("#textarea6").keydown(function(event) {textarea6(event)});

function textarea6(e) {
	var key = e.which;
	if (key===13) {
		e.preventDefault();
		eval(document.getElementById('textarea6').value);
		outputArea.value = "out = " + out;
	}
}
$("#textarea62").keydown(function(event) {textarea62(event)});

function textarea62(e) {
	var key = e.which;
	if (key===13) {
		e.preventDefault();
		try {
			eval(document.getElementById('textarea62').value);
			respL = leftResponse(coh6,dir6);
			respR = rightResponse(coh6,dir6);
			var dirs = ['Left','','Right'];
			outputArea2.innerHTML = "Coherence = " + (Math.round(coh6*100)/100) + "&#13;&#10;Direction = " + dirs[dir6+1] + "&#13;&#10;Left response = " + respL + "&#13;&#10;Right response = " + respR;
			done6 = true;
			document.getElementById("continue").style.display="";
			document.getElementById("end6").style.display="";
		} catch (error) {
			outputArea2.innerHTML = "Your code produced an error: " + "&#13;&#10;" + error;
		}
	}
}

function bonus1() {
	document.getElementById("bonus1").style.display="";
}

////////////////////////////////
////////// BLOCK 7 /////////////
////////////////////////////////
var outputArea7 = document.getElementById("output7");

$("#textarea7").keydown(function(event) {textarea7(event)});

function textarea7(e) {
	var key = e.which;
	if (key===13) {
		e.preventDefault();
		try {
			eval(document.getElementById('textarea7').value);
			var l = Math.random()*10;
			var r = Math.random()*10;
			var acc = Math.random()*100-50;
			var true_na = acc + l-r;
			var na = accumulateDDM(l,r,acc);
			var na_correct = true_na==na;
			var threshold = 20;
			var dir = atThreshold(true_na,threshold);
			var true_dir = (true_na>threshold) ? 1 : ((true_na<(-threshold)) ? -1 : 0);
			var dir_correct = dir==true_dir;
			outputArea7.innerHTML = "You accumulated: " + na + " we got: " + true_na + " your result is: " + na_correct + "&#13;&#10;You said the dir was: " + dir + " we got: " + true_dir + " your result is: " + dir_correct;
			if (na_correct && dir_correct) {
				done7 = true;
				document.getElementById("continue").style.display="";
				document.getElementById("end7").style.display="";	
				resetSample7();
			}
		} catch (error) {
			outputArea7.innerHTML = "Your code produced an error: " + "&#13;&#10;" + error;
		}
	}
}

var canvas_sample2 = document.getElementById("sample2");
var ctx_sample2 = canvas_sample2.getContext("2d");

var tick7;

var dots7 = initDots(400,100,100,0,0,0.075,1);
var coherence7 = 0.75;
var dir7 = 1;


function drawMotionSample7() {
	var el = elapsed();
	dots7 = updateDots(dots7,coherence7,dots7.dir,el)
	// draw
	ctx_sample2.clearRect(0,0,canvas_sample.width,canvas_sample.height);
	clipCtx(ctx_sample2,canvas_sample2);
		drawDots(dots7,ctx_sample2);
	ctx_sample2.restore();

	tick7 = window.requestAnimationFrame(drawMotionSample7);
}

function resetSample7() {
	coherence7 = Math.random()*2-1;
	dir7 = (coherence7>0) ? 1 : -1;
	dots7.dir = (coherence7>0) ? 0 : Math.PI;
	coherence7 = Math.abs(coherence7);
	// Re-build the plot
	drawPlot7();
}

function buildPlot3() {
	var mult = 2; // response multiplier (coherence>0) ? (coherence + randn() * noise)*mult : randn()*noise*mult
	var noise = 1;
	var data = {};
	// build up the variables for the plot
	// the evidence runs are just the L/R evidence 
	data.eL = [0]; // evidence left
	data.eR = [0];
	data.E = [0]; // accumulated evidence
	data.time = range(1,40);
	for (var i=1; i<40; i++) {
		var l = leftResponse(coherence7,dir7);
		var r = rightResponse(coherence7,dir7);
		var E = accumulateDDM(l,r,data.E[i-1]);
		data.eL.push(l);
		data.eR.push(r);
		data.E.push(E);
	}
	return data;
}

function drawPlot7() {
	var data2;
	try {
		data2 = buildPlot3();
	} catch (err) {
		console.log(err);
		return;
	}
	traceL = {
		x: data2.time,
		y: data2.eL,
		mode:'line',
		line:{color:'blue'},
		type:'scatter',
		name:'Left population response'
	}
	traceR = {
		x: data2.time,
		y: data2.eR,
		mode:'line',
		line:{color:'red'},
		type:'scatter',
		name:'Right population response'
	}
	traceM = {
		x: data2.time,
		y: data2.E,
		mode:'line',
		marker: {color:'black'},
		type:'scatter',
		name:'Accumulated evidence (left - right)'
	}
	var layout7 = layout;
	layout7.title = 'Accumulated evidence';
	layout7.xaxis.title = 'Time (ms)';
	layout7.xaxis.range = [0,40];
	layout7.yaxis.title = 'Evidence for RIGHT --------- Evidence for LEFT';
	layout7.yaxis.range = [-25,25];
	Plotly.newPlot('plot3',[traceL,traceR, traceM],layout7);
}

////////////////////////////////
////////// BLOCK 8 /////////////
////////////////////////////////
var diffusion_rate = 1;
var drift_rate = 5;
var threshold = 0;

var outputArea8 = document.getElementById("output8");

$("#textarea8").keydown(function(event) {textarea8(event)});

function textarea8(e) {
	var key = e.which;
	if (key===13) {
		e.preventDefault();
		try {
			eval(document.getElementById('textarea8').value);
			var out = runSimulation8();
			var correct_pos = ['negative','','positive'];
			var correct_dir = ['RIGHT','','LEFT'];
			var posneg = diffusion_rate > 0 ? 2 : 0;
			outputArea8.innerHTML = "Hit rate: " + Math.round(out.hit*100) + "%&#13;&#10;Miss rate: " + Math.round(out.miss*100) + "%&#13;&#10;No response: " + Math.round(out.NR*100) + "%&#13;&#10;Mean RT: " + Math.round(out.RT_*100)/100	 + " ticks" + "%&#13;&#10;Your diffusion rate was " + correct_pos[posneg] + " so the correct answer was always " + correct_dir[posneg];
		} catch (error) {
			outputArea8.innerHTML = "Your code produced an error: " + "&#13;&#10;" + error;
		}
	}
}

var data8 = {};

function runSimulation8() {
	// Run simulation using parameters
	data8 = {};
	data8.n = 25;
	data8.data = createArray(data8.n,40);
	data8.hit = 0;
	data8.miss = 0;
	data8.NR = 0;
	data8.RT = [];
	data8.time = range(1,40);
	for (var i = 0; i < data8.n; i++) {
		data8.data[i][0] = 0;
		var done = false;
		for (var j = 1; j < 40; j++) {
			if (!done) {
				data8.data[i][j] = data8.data[i][j-1] + diffusion_rate + randn()*drift_rate;
				if (data8.data[i][j] > threshold) {
					data8.hit += 1;
					data8.RT.push(j);
					done = true;
				} else if (data8.data[i][j] < (-threshold)) {
					data8.miss += 1;
					data8.RT.push(j);
					done = true;
				}
			} else {
				data8.data[i][j] = NaN;
			}
		}
	}
	data8.NR = data8.n-data8.hit-data8.miss;
	// Compute statistics
	var out = {};
	out.hit = data8.hit/data8.n;
	out.miss = data8.miss/data8.n;
	out.NR = data8.NR/data8.n;
	out.RT_ = mean(data8.RT);
	// Plot simulation
	drawPlot8();

	return out;
}

function drawPlot8() {
	var traces = [];
	var maxY = 0;
	for (var i=0;i<data8.n;i++) {
		maxY = max(maxY,data8.data[i]);
		var trace = {
			x: data8.time,
			y: data8.data[i],
			mode:'line',
			marker: {color:'black'},
			type:'scatter'
		}
		traces.push(trace);
	}
	var layout8 = layout;
	layout8.title = 'Drift diffusion model, 25 runs';
	layout8.xaxis.title = 'Time (model ticks)';
	layout8.xaxis.range = [0,40];
	layout8.yaxis.title = 'Evidence for RIGHT --------- Evidence for LEFT';
	layout8.yaxis.range = [-maxY,maxY];
	layout8.showlegend = false;
	Plotly.newPlot('plot8',traces,layout8);
}

////////////////////////////////
////////// BLOCK 9 /////////////
////////////////////////////////

$("#textarea9").keydown(function(event) {textarea9(event)});

function textarea9(e) {
	var key = e.which;
	if (key===13) {
		e.preventDefault();
		try {
			eval(document.getElementById('textarea9').value);
			simCompiled = true;
			drawPlot9(rs_data);
		} catch (error) {
			outputArea2.innerHTML = "Your code produced an error: " + "&#13;&#10;" + error;
		}
	}
}

function rs_diffusion(coherence,dir) {
	return dir*coherence*diffusion_rate;
}

function rs_drift(coherence,dir) {
	return randn()*drift_rate;
}

var upper_threshold = 40,
	lower_threshold = 20;

function rs_threshold(coherence,dir) {
	return [upper_threshold,lower_threshold];
}

function addSimulation(data) {
	var reps = 56; // tied to roitman shadlen data
	// Uses the user defined functions:
	// rs_diffusion, rs_drift, and rs_threshold
	// which each require the coherence and direction (1/-1) 

	// This simulation might be slow...?

	// Go through rs_data, grab the current coherence, simulate 56 runs of each 
	// correct and incorrect then average the results.
	// Then these can be added to the plot as lines. The difficult thing

	var copts = ['incorrect','correct'];
	var baseF = 41; // initial firing rate for all model trajectories
	var dir = 1; // always use one direction
	for (var ci=0;ci<2;ci++) {
		data[copts[ci]].m = {};
		// per condition (correct/incorrect)
		// data.[copts[ci]].my = createArray(6,0);
		for (var i=0;i<6;i++) {
			data[copts[ci]].m[i] = [];
			var ccoh = data.coherence[i];
			// SIMULATION
			var xdata = data[copts[ci]].x[i];
			sim = createArray(xdata.length,reps);
			var repscomplete = 0;
			var repsattempted = 0;
			while (repscomplete<reps && repsattempted<500) {
				// Add a replicate
				var crdone = false;
				for (var si=0;si<xdata.length;si++) {			
					if (si==0) {
						//just initialize
						sim[si][repscomplete] = baseF;
					} else {
						var deltax = Math.round(xdata[si]-xdata[si-1]);
						sim[si][repscomplete] = sim[si-1][repscomplete] + deltax*rs_diffusion(ccoh,dir) + deltax*rs_drift(ccoh,dir);
					}
					if ((sim[si][repscomplete] > rs_threshold()[0]) && ci==1) {crdone = true;}
					if ((sim[si][repscomplete] < rs_threshold()[1]) && ci==0) {crdone = true;}
				}
				if (crdone) {
					repscomplete+=1;
				} // If we didn't get a success, repeat this repetition
				repsattempted+=1;
			}
			if (repscomplete<reps) {
				// This simulation failed, return zeros
				data[copts[ci]].m[i] = baseF*ones(xdata.length);
			} else {
				// The simulated succeeded, average replications
				for (var si=0;si<xdata.length;si++) {
					data[copts[ci]].m[i].push(nanmean(sim[si]));	
				}	
				hold = sim;
			}
		}
	}

	return data;
}

var simCompiled = true;

function drawPlot9(rs_data) {
	if (simCompiled) {
		try{
			rs_data = addSimulation(rs_data);
		} catch (error) {
			console.log(error);
		}
	}
	var copts = ['incorrect','correct'];
	var lopts = [false,true];
	var sopts = [3,5];
	var ltopts = ['dot','solid'];
	var colors = ['#005350','#4ac80d','#ec174d','#029d59','#8f33c6','#f79c1a'];
	// Using rs_data from roitman shadlen 2002
	var traces = [];
	for (var ci=0;ci<2;ci++) {
		for (var i=0;i<6;i++) {
			var trace = {
				x: rs_data[copts[ci]].x[i],
				y: rs_data[copts[ci]].y[i],
				mode:'markers',
				marker: {color:colors[i],size:sopts[ci]},
				type:'scatter',
				name:(rs_data.coherence[i]*100),
				showlegend:lopts[ci]	
			}
			traces.push(trace);
			if (simCompiled) {
				var traceS = {
					x: rs_data[copts[ci]].x[i],
					y: rs_data[copts[ci]].m[i],
					mode:'lines',
					line: {color:colors[i],size:1,dash:ltopts[ci]},
					type:'scatter',
					showlegend:false
				}
				traces.push(traceS);
			}
		}
	}
	layout9 = layout;
	layout9.title = 'DDM fit to Roitman Shadlen data';
	layout9.xaxis.title = 'Time (ms)';
	layout9.xaxis.range = [175,825];
	layout9.yaxis.title = 'Firing Rate (sp/s)';
	layout9.yaxis.range = [20,70];
	layout9.showlegend = true;
	layout9.height = 700;
	layout9.width = 500;
	Plotly.newPlot('plot9',traces,layout9);
}

///////////////////////////////////
////////// LOCAL CODE /////////////
///////////////////////////////////

var done2 = false;
var done6 = false;
var done7 = false;

function stopMotion() {
	window.cancelAnimationFrame(tick3);
	window.cancelAnimationFrame(tick4);
	window.cancelAnimationFrame(tick5);
	window.cancelAnimationFrame(tick7);
}

function run(i) {
	stopMotion();				
	document.getElementById("continue").style.display="";
	// Runs each time a block starts incase that block has to do startup
	switch(i) {
		case 2:
			init2();
			cur2 = 0;
			$("#step2").show();
			$("#continue").hide();
			$("body").keydown(function(event) {continue2(event)});
			break;
		case 3:
			elapsed();
			drawMotionPatches();
			break;
		case 4:
			elapsed();
			drawMotionDemo();
			$("#4lr_div").hide();$("#4population_div").hide();
			$("#4lr").hide(); $("#4population").hide();
			$("#continue").hide();
			$("body").keydown(function(event) {end4(event)});
			break;
		case 5:
			elapsed();
			drawMotionSample();
			break;
		case 6:
			if (!done6) {
				document.getElementById("continue").style.display="none";
			}
			break;
		case 7:
			elapsed();
			drawMotionSample7();
			if (!done7) {
				document.getElementById("continue").style.display="none";
			}
			break;
 }
}

var rs_data;

function read_RS_CSV(file) {
	rs_data = {};
	var data = $.csv.toArrays(file);
	rs_data.coherence = [0,.032,.064,.128,.256,.512];
	rs_data.correct = {}; rs_data.incorrect = {};
	rs_data.correct.x = createArray(6,0);
	rs_data.correct.y = createArray(6,0);
	rs_data.incorrect.x = createArray(6,0);
	rs_data.incorrect.y = createArray(6,0);
	 copts = ['incorrect','correct'];
	for (var i=0;i<data.length;i++) {
		 ccoh = data[i][3];
		 ccorr = data[i][2];
		 cx = data[i][0];
		 cy = data[i][1];
		for (var j=0;j<6;j++) {
			if (ccoh==rs_data.coherence[j]) {
				rs_data[copts[ccorr]].x[j].push(Number(cx));
				rs_data[copts[ccorr]].y[j].push(Number(cy));
			}
		}
	}
	drawPlot9(rs_data);
}

function launch_local() {
	// katex.render("y(t)=y_{0}+v_{y}t+\\frac{1}{2}at^{2}",document.getElementById("katex1"),{displayMode:true});
	// katex.render("y(t)=y_{0}+v_{y}t+\\frac{1}{2}at^{2}",document.getElementById("katex2"),{displayMode:true});	
	katex.render("A(t)=\\sum_{i=0}^{t} left(i)-right(i)",document.getElementById("katex3"),{displayMode:true});	
	katex.render("Response(coherence) = f(coherence) + \\epsilon",document.getElementById("katex4"),{displayMode:true});	
	// drawPlot1();
	drawPlot2();
	document.getElementById("end6").style.display="none";
	document.getElementById("end7").style.display="none";
	$.ajax({ url: "roitmanshadlen2002.csv", success: function(file_content) {
    read_RS_CSV(file_content);
	  }
	});
}

