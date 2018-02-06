var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

////////////////////////////////
////////// ANIMATION /////////////
////////////////////////////////

var tick;

var trial = 0;
var trials = 50;
var onscreen = true;

var con1_1 = [];
var con2_1 = [];
var con3_1 = [];
var con4_1 = [];

var con1_2 = [];
var con2_2 = [];
var con3_2 = [];
var con4_2 = [];

var cues = initCues(canvas);

var isFocal = [];
var respLoc = [];

var subjResps = [];

var t; // elapsed time tracker

var key = false; // tracks key situtation
var state = false; // false = waiting incoherent, true = currne trial

var tstart = undefined, // trial start tracker (for RT)
		rtstart = undefined;

function draw() {
	t = elapsed();
  $("#resp").hide();
	ctx.clearRect(0,0,canvas.width,canvas.height);

  //isFocal = 1;
  //respLoc = 1;

  // First, cue for 1 second
  if (state) {
    drawCue(cues, isFocal[trial], respLoc[trial], ctx);
    drawBoxes(con1_1, con2_1, con3_1, con4_1);
  }

  // Then, stim 1
  if (state && (now()-tstart>1000)) {
    drawContrasts(con1_1, ctx);
    drawContrasts(con2_1, ctx);
    drawContrasts(con3_1, ctx);
    drawContrasts(con4_1, ctx);
    drawBoxes(con1_1, con2_1, con3_1, con4_1);
  }
  
  // ISI1
  if (state && (now() - tstart > 1600)){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    drawCue(cues, isFocal[trial], respLoc[trial], ctx);
    drawBoxes(con1_1, con2_1, con3_1, con4_1);
  }

  // Stim 2
  if (state && (now() - tstart > 1800)){
    drawContrasts(con1_2, ctx);
    drawContrasts(con2_2, ctx);
    drawContrasts(con3_2, ctx);
    drawContrasts(con4_2, ctx);
  }

  // ISI2: Clear screen after stim 2
  if (state && (now() - tstart > 2200)){
    ctx.clearRect(0,0,canvas.width, canvas.height);
    drawCue(cues, isFocal[trial], respLoc[trial], ctx);
    drawBoxes(con1_1, con2_1, con3_1, con4_1);
  }
  
  // Show response cue
  if (state && (now() - tstart > 2600)){
    ctx.clearRect(0,0,canvas.width, canvas.height);
    drawCue(cues, true, respLoc[trial], ctx);
    drawBoxes(con1_1, con2_1, con3_1, con4_1);
    $("#resp").show();
  }


	if (onscreen) {
		clipCtx(ctx,canvas);
		ctx.restore();
	}

	if (trial >= trials) {
		stop();
		ctx.clearRect(0,0,canvas.width,canvas.height);
		$("#canvas").hide();
		$("#prog").hide();
		$("#continue").show();
		next();
		return;
	}

	if (key) {
		switch (key) {
			case 49: // 1
				if (state) {
          subjResps.push(1);
					state = false;
					$("#waiting").show();
					calcVals(isFocal[trial]);
					trial++;
				}
				break;
			case 50: // 2
				if (state) {
          subjResps.push(2);
					state = false;
					$("#waiting").show();
					calcVals(isFocal[trial]);
					trial++;
				}
				break;
			case 38: // up
      case 32: // space
      case 81: // q
				if (!state) {
          setupTrial();
					state = true;
					$("#waiting").hide();
					tstart = now();
				}
				break;
		}
	}

	// progress bar
	document.getElementById("prog").value = trial / trials;

	tick = window.requestAnimationFrame(draw);
}

///////////////////////////////////
////////// LOCAL CODE /////////////
///////////////////////////////////

var RT = [];
var RTc = [];
var correct = [];
var correctc = [];

var option = 0;

// Precompute the conditions
var contrasts = [.3, .4, .5, .6, .7];
var contrastVals = [.03, .07, .20, .50, .75];
var contrastDiff = [.2]; 
var conDiffDist = [.2];
var baseContrast = [];
var fixStairInc = .02;
var myContrast = getRandomSubarray(contrasts, 1)[0];
var trialContrast = [];
var correctResp = [];
var stairCtr = 0; var stairCtrDist = 0;

function setupTrial() {
  trFocal = Math.random() > 0.5;
  isFocal.push(trFocal);
  var cueLoc = getRandomSubarray([...Array(4).keys()], 4); // cueLoc will be the first
  respLoc.push(cueLoc[0]);
  console.log(cueLoc);
  jitter = Math.random()*.1 - .05;
  baseContrast.push(myContrast+jitter);
  if (Math.random() > 0.5){ // Randomize order of which stimulus is greater.
    if (trFocal){
      var tc = myContrast + jitter + contrastDiff[trial];
    } else{ var tc = myContrast + jitter + conDiffDist[trial];}
  }else{
    if(trFocal){
      var tc = myContrast + jitter - contrastDiff[trial];
    } else{ var tc = myContrast + jitter - conDiffDist[trial];}
  }
  trialContrast.push(tc);
  con1_1 = initContrastPatch(cueLoc[0], tc, canvas);
  con2_1 = initContrastPatch(cueLoc[1], getRandomSubarray(contrasts,1)[0]+Math.random()*.01-.05, canvas);
  con3_1 = initContrastPatch(cueLoc[2], getRandomSubarray(contrasts,1)[0]+Math.random()*.01-.05, canvas);
  con4_1 = initContrastPatch(cueLoc[3], getRandomSubarray(contrasts,1)[0]+Math.random()*.01-.05, canvas);

  con1_2 = initContrastPatch(cueLoc[0], myContrast+jitter, canvas);
  con2_2 = initContrastPatch(cueLoc[1], getRandomSubarray(contrasts,1)[0]+Math.random()*.01-.05, canvas);
  con3_2 = initContrastPatch(cueLoc[2], getRandomSubarray(contrasts,1)[0]+Math.random()*.01-.05, canvas);
  con4_2 = initContrastPatch(cueLoc[3], getRandomSubarray(contrasts,1)[0]+Math.random()*.01-.05, canvas);

  if (tc > myContrast+jitter){
    correctResp.push(1);
  }else{
    correctResp.push(2);
  }
}

function calcVals(trialType) {
  if(correctResp[trial] == subjResps[trial]){ // correct response
    corr = true;
    if (trialType == 0 ){//distributed
      stairCtrDist++;
      if(stairCtrDist > 2){
        conDiffDist.push(conDiffDist[trial] - fixStairInc);
        stairCtrDist = 0;
      } else{
        conDiffDist.push(conDiffDist[trial]);
      }
      contrastDiff.push(contrastDiff[trial]);
    } else { // focal
      stairCtr++;
      if(stairCtr>2){ // decrement contrast difference after 3 correct trials in a row.
        contrastDiff.push(contrastDiff[trial] - fixStairInc);
        stairCtr = 0;
      } else { 
        contrastDiff.push(contrastDiff[trial]);
      }
      conDiffDist.push(conDiffDist[trial]);
    }
    fbText = 'Correct! Press Q to continue.';
  } else{ //incorrect response --> increment contrast difference.
    corr = false;
    if (trialType == 0) {
      stairCtrDist = 0;
      conDiffDist.push(conDiffDist[trial] + fixStairInc);
      contrastDiff.push(contrastDiff[trial]);
    }else{
      stairCtr = 0;
      contrastDiff.push(contrastDiff[trial] + fixStairInc);
      conDiffDist.push(conDiffDist[trial]);
    }
    fbText = 'Incorrect! Press Q to continue.';
  }
  document.getElementById("waiting").innerHTML=fbText;
  drawFeedback(corr, canvas, ctx);
	RT.push(now()-rtstart);
	rtstart = undefined;
	tstart = undefined;
	correct.push(corr);
}

document.addEventListener("keydown",keyPress,false);

function keyPress(event) {
	key = event.which;
	if (key==37 || key==39 || key==38 || key==40) {event.preventDefault();}
}

var done2 = false;

function stop() {
	window.cancelAnimationFrame(tick);

  var lastN = 7;

  var focalAcc = correct.filter(function (elem, i, array){ return isFocal[i]==1});
  var distAcc = correct.filter(function (elem, i, array){ return isFocal[i]==0});
  var fNumCorr = focalAcc.reduce(add, 0);
  var dNumCorr = distAcc.reduce(add,0);

  var focalSens = contrastDiff.filter(function (elem, i, array){ return isFocal[i]==1});
  var distSens = contrastDiff.filter(function (elem, i, array){ return isFocal[i]==0});

  document.getElementById("fAcc").value = "Focal attention accuracy: " + Math.round(100*fNumCorr / focalAcc.length) + "%";
  document.getElementById("dAcc").value = "Distributed attention accuracy: " + Math.round(100*dNumCorr / distAcc.length) + "%";

  var fSens= mean(focalSens.slice(focalSens.length-lastN, focalSens.length).map(function (elem) {return Math.abs(elem);}));
  var dSens= mean(distSens.slice(distSens.length-lastN, distSens.length).map(function (elem) {return Math.abs(elem)}));
  document.getElementById("fSens").value = "Focal attention contrast sensitivity threshold: " + fSens;
  document.getElementById("dSens").value = "Distributed attention contrast sensitivity threshold: " + dSens;

}

function run(i) {
	// Runs each time a block starts incase that block has to do startup
  console.log(i);
	switch(i) {
		case 2:
			//setup();
			$("#continue").hide();
			t = elapsed();
			draw();
			break;
 }
}

function launch_local() {
	// katex.render("y(t)=y_{0}+v_{y}t+\\frac{1}{2}at^{2}",document.getElementById("katex1"),{displayMode:true});
	// katex.render("y(t)=y_{0}+v_{y}t+\\frac{1}{2}at^{2}",document.getElementById("katex2"),{displayMode:true});	
}

function add(a,b){
  return a +b;
}

function subtract(a1,a2){
  ar = [];
  for(i=0; i<a1.length; i++){
    ar.push(a1[i] - a2[i]);
  }
  return ar;
}
