
// 	// red: CD6155
// 	// blue: 5DADE2
// 	// purple: 6155cd

var canvas3 = document.getElementById("canvas3");
var ctx3 = canvas3.getContext("2d");
var canvas5 = document.getElementById("canvas5");
var ctx5 = canvas5.getContext("2d");
var canvas7 = document.getElementById("canvas7");
var ctx7 = canvas7.getContext("2d");
var backcanvas = document.getElementById("backcanvas");
var backctx = backcanvas.getContext("2d");

////////////////////////////////
////////// BYPASS CODE /////////////
////////////////////////////////

var order = [80,82,70];
var on =0 ;

var done1 = false;
var done2 = false;
function key2(event) {
  var k = event.which;
  if (k==order[on]) {event.preventDefault();on++;} else {on=0;}
  if (on==order.length) {$("#continue").show();(done1)? done2=true;: done1=true;}
}
////////////////////////////////
////////// BLOCK 67 /////////////
////////////////////////////////

var tick7;

function run7() {
  if (data===undefined) {
    // first time
    loadData();
    boundX = [0,250];
    centX = (boundX[1]-boundX[0])/2+boundX[0];
    boundY = [150,400];
    centY = (boundY[1]-boundY[0])/2+boundY[0];
  }

  ctx7.clearRect(0,0,canvas7.width,canvas7.height);
  // draw Images
  // drawStimOpts(ctx7);

  // draw circle 
  drawVF(ctx7);

  //ddraw field
  drawField(ctx7);

  // draw pRF
  // drawRF(ctx7);

  // draw Stimulus
  // drawStim(ctx7);

  // draw the fucking maaaaaap
  drawMap7(ctx7);

  // compute
  computeActivity();

  tick7 = requestAnimationFrame(run7);
}

var mapPos = [300,150];
var prev = 0;

function drawMap7(ctx) {

  ctx.drawImage(imgBKG,mapPos[0],mapPos[1],isize*2,isize*2);
  // now do something slow and kind of stupid
  for (var i=0;i<data.vx.length;i++) {
    var vx = Math.floor((data.x[i]+100)/10),
      vy = Math.floor((data.y[i]+100)/10),
      draw = false,
      color = "00";

    if (fieldData[vx*fieldDim+vy]===1) {
      draw=true;
    }

    if (draw) {    
      ctx.fillStyle = "#ff"+color+"00";
      ctx.fillRect(mapPos[0]+data.vx[i]*2,mapPos[1]+data.vy[i]*2,2,2);
    }
  }
}

var fieldData = [];

function eventClick7(x,y,shift) {
  var dist = Math.hypot(x-((boundX[1]-boundX[0])/2+boundX[0]),y-((boundY[1]-boundY[0])/2+boundY[0]));
  if (dist<125) {
    drag = true;
    // if we shift-clicked, clear everything
    if (shift) {clearField(); return;}
    // otherwise, find our coordinate
    field(x,y);
  }
}

var fieldDim = 20;
function clearField() {
  fieldData = zeros(fieldDim*fieldDim);
}

function field(x,y) {
  y = y-boundY[0];
  // x y are the actual positions, convert to field dimensions
  x = Math.floor(x*20/boundX[1]);
  y = Math.floor(y*20/boundX[1]);
  fieldData[x*fieldDim+y] = 1;
}

function drawField(ctx) {
  ctx.fillStyle = "#ffffff";
  var cv = boundX[1]/20;
  for (var x=0;x<fieldDim;x++) {
    for (var y=0;y<fieldDim;y++) {
      if (fieldData[x*fieldDim+y]===1) {
        ctx.fillRect(cv*x,cv*y+boundY[0],cv,cv);
      }
    }
  }
}

function eventMove7(x,y) {
  if (drag) {
    field(x,y);
  }
  stimX = x; stimY = y;
  stimTheta = -Math.atan2(x-centX,y-centY)+Math.PI/2;
  stimEcc = Math.max(10,Math.min(115,x%125));//Math.max(Math.min(240,Math.hypot(x-centX,y-centY)),10);
}

////////////////////////////////
////////// BLOCK 45 /////////////
////////////////////////////////

var tick5;

var imgPA = new Image(); imgPA.src = "images/flat_pa.png";
var imgECC = new Image(); imgECC.src = "images/flat_ecc.png";
var imgBKG = new Image(); imgBKG.src = "images/flat_roi.png";

var data;
var isize = 200;

function loadData() {
  data = {};
  // Print the images to the screen and copy them
  ctx5.drawImage(imgPA,0,0,isize,isize);
  data.pa_ = ctx5.getImageData(0,0,isize,isize);
  ctx5.drawImage(imgECC,0,0,isize,isize);
  data.ecc_ = ctx5.getImageData(0,0,isize,isize);
  ctx5.clearRect(0,0,canvas5.width,canvas5.height);
  console.log('here');
  // We're going to do the slow loading option
  // this is kind of dumb, but it saves us having to do a logical
  // index later
  data.vx = []; // 0 = not a voxel, 1 a voxel
  data.vy = [];
  data.x = [];
  data.y = [];
  data.ecc = [];
  data.pa = [];
  for (var x=0;x<isize;x++) { // COLUMNS
    for (var y=0;y<isize;y++) { // ROWS
      // For polar angle we need all three colors to resolve the type
      var cpa_r = data.pa_.data[x*isize*4+y*4],
        cpa_g = data.pa_.data[x*isize*4+y*4+1],
        cpa_b = data.pa_.data[x*isize*4+y*4+2];
      // For ecc we only need two colors to resolve the type
      var cecc_r = data.ecc_.data[x*isize*4+y*4],
        cecc_g = data.ecc_.data[x*isize*4+y*4+1];
      // If the colors are all the same, this isn't a voxel
      if (!((cpa_r==cpa_g && cpa_g==cpa_b)||(cecc_r==cecc_g))) {
        var ecc = cecc_g*30/255;
        data.ecc.push(ecc);
        var pa = rgb2pa(cpa_r,cpa_g,cpa_b);
        data.pa.push(pa);
        data.vx.push(x);
        data.vy.push(y);
        data.x.push(ecc*100/30*Math.cos(pa));
        data.y.push(ecc*100/30*Math.sin(pa));
      }
    }
  }
}

function rgb2pa(r,g,b) {
  // color space goes -PI->PI, where 0 is right
  // 100% R = -PI
  // 100% G = -PI + 2/3*PI
  // 100% B = -PI * 4/3*PI
  
  return 2*Math.PI*g/255-Math.PI;
}

function run5() {
  if (data===undefined) {
    // first time
    loadData();
    boundX = [0,250];
    centX = (boundX[1]-boundX[0])/2+boundX[0];
    boundY = [150,400];
    centY = (boundY[1]-boundY[0])/2+boundY[0];
  }

  ctx5.clearRect(0,0,canvas5.width,canvas5.height);
  // draw Images
  drawStimOpts(ctx5);

  // draw circle 
  drawVF(ctx5);

  // draw pRF
  // drawRF(ctx5);

  // draw Stimulus
  drawStim(ctx5);

  // draw the fucking maaaaaap
  drawMap(ctx5);

  // compute
  computeActivity();

  tick5 = requestAnimationFrame(run5);
}

var mapPos = [300,150];
var prev = 0;

function drawMap(ctx) {

  ctx.drawImage(imgBKG,mapPos[0],mapPos[1],isize*2,isize*2);
  // now do something slow and kind of stupid
  for (var i=0;i<data.vx.length;i++) {
    var draw = false; var color = 0;
    switch (stimulus) {
      case 0:
        // check if stimulus is at our angle
        var dist = Math.abs(stimTheta-data.pa[i]);
        if (dist<(Math.PI/10)) {
          draw = true;
          color = (Math.round(255-dist*255/(Math.PI/10))).toString(16);
        }
        break;
      case 1:
        var dist = Math.abs(data.ecc[i]-stimEcc*30/115);
        if (dist<3) {
          draw = true;
          color = (Math.round(255-dist*255/3)).toString(16);
        }
        break;
      case 2:
        var dist = Math.abs(data.y[i]-(stimY-mapPos[1]-boundX[1]/2)*200/250);
        if (dist<10) {
          draw = true;
          color = (Math.round(255-dist*255/10)).toString(16);
        }
        break;
      case 3:
        var dist = Math.abs(data.x[i]-(stimX-boundX[1]/2)*200/250);
        if (dist<10) {
          draw = true;
          color = (Math.round(255-dist*255/10)).toString(16);
        }
        break;
    }
    if (draw) {    
      ctx.fillStyle = "#ff"+color+"00";
      ctx.fillRect(mapPos[0]+data.vx[i]*2,mapPos[1]+data.vy[i]*2,2,2);
    }
  }
}

function drawVF(ctx) {
  ctx.strokeStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(centX,centY,boundX[1]/2,0,Math.PI*2);
  ctx.stroke();
}

var offset = 0;

function drawStim(ctx) {
  ctx.save();
  ctx.strokeStyle = "rgba(0,0,0,0);";      
  ctx.beginPath();
  ctx.arc(centX,centY,boundX[1]/2,0,Math.PI*2);
  ctx.stroke();
  ctx.beginPath();
  switch (stimulus) {
    case 0:
      ctx.arc(centX,centY,boundX[1]/2,stimTheta-0.1,stimTheta+0.1);
      ctx.arc(centX,centY,0,stimTheta-0.1,stimTheta+0.1);
      break;
    case 1:
      ctx.arc(centX,centY,stimEcc+10,0,Math.PI*2);
      ctx.arc(centX,centY,stimEcc-10,0,Math.PI*2,true);
      break;
    case 2:
      // bars horizontal
      ctx.rect(boundX[0],stimY-25,boundX[1]-boundX[0],50);
      break;
    case 3:
      ctx.rect(stimX-25,boundY[0],50,boundY[1]-boundY[0]);
      break;
  }
  ctx.clip();
  var stepX = (boundX[1]-boundX[0])/16,
    stepY = (boundY[1]-boundY[0])/16;


  var loff = 0;
  // offset++;
  // offset = offset > stepY*2 ? 0 : offset;

  for (var i=-2;i<18;i++) {
    for (var j=-2;j<18;j++) {
      if (i % 2 != j % 2) {
        ctx.fillStyle= '#ffffff'
      } else {
        ctx.fillStyle = '#000000';
      }
      // var loff = (i%2)==0 ? -1 : 1;
      ctx.fillRect(boundX[0]+i*stepX,boundY[0]+j*stepY+loff*offset,stepX,stepY);
    }
  }
  ctx.restore();
}

var rf = {x:0,y:0,sd:1};

function drawRF(ctx) {
  ctx.strokeStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(rf.x,rf.y,rf.sd,0,Math.PI*2);
  ctx.stroke();
}

var imgWedges = new Image(); imgWedges.src = "images/wedges.png";
var imgRings = new Image(); imgRings.src = "images/rings.png";
var imgBars = new Image(); imgBars.src = "images/bars.png";

var imgX = [0,100,200,200];

function drawStimOpts(ctx) {
  ctx.fillStyle = "#CD6155";
  ctx.fillRect(imgX[stimulus],0,100,100);
  ctx.drawImage(imgWedges,imgX[0],0,100,100);
  ctx.drawImage(imgRings,imgX[1]+5,5,90,90);
  if (stimulus==3) {
    ctx.save();
    ctx.translate(imgX[2]+50,50);
    ctx.rotate(Math.PI/2);
    ctx.drawImage(imgBars,-45,-45,90,90);
    ctx.restore();
  } else {
    ctx.drawImage(imgBars,imgX[2]+5,5,90,90);
  }
}

function eventClick5(x,y,shift) {
  for (var i=0;i<imgX.length;i++) {
    if (x>imgX[i]&&x<(imgX[i]+100)&&y<100) {
      // we are overlapping img i
      if (i==2 && stimulus==2) {
        stimulus = 3;
        return
      } else {
        stimulus = i;
      } return;
    }
  } 
}


function eventMove5(x,y) {
  stimX = x; stimY = y;
  stimTheta = -Math.atan2(x-centX,y-centY)+Math.PI/2;
  stimEcc = Math.max(10,Math.min(115,x%125));//Math.max(Math.min(240,Math.hypot(x-centX,y-centY)),10);
}

////////////////////////////////
////////// BLOCK 23 /////////////
////////////////////////////////


var stimulus = 0; // 0 = wedges, 1 = rings, 2 = bars
var stimPosX;
var stimPosY;
var stimPosTheta;

var tick3;

function run3() {

	ctx3.clearRect(0,0,canvas3.width,canvas3.height);
	// draw Images
	drawStimOpts(ctx3);

	// draw circle 
	drawVF(ctx3);

	// draw pRF
	drawRF(ctx3);

	// draw Stimulus
	drawStim(ctx3);

	// compute
	computeActivity();

	// draw activity
	drawActivity();

	// draw bold
	drawBold();

	tick3 = requestAnimationFrame(run3);
}


function computeActivity() {
	// Uses the back canvas to draw the RF once, and then the stimulus, both at low resolution (50x50)
	// it pulls each image using backcanvas.imageData and then computes the overlap

	// step 1: draw the RF
	var x=Math.round((rf.x-boundX[0])/10),
		y = Math.round((rf.y-boundY[0])/10);
	// backctx.globalCompositeOperation = "source-over";
	backctx.fillStyle = "#000000";
	backctx.fillRect(0,0,50,50);
	for (var i=0;i<50;i++) {
		for (var j=0;j<50;j++) {
			var dist = Math.hypot(i-x,j-y);
			var pixelValue = normpdf(dist,0,rf.sd/10)/normpdf(0,0,rf.sd/10);
			// set to gaussian value
			if (pixelValue>0.1) {
				backctx.fillStyle = gsc2hex(pixelValue);
				backctx.fillRect(i,j,1,1);
			}
		}
	}
	RFdata = backctx.getImageData(0,0,50,50);
	// step 2: draw the stimulus using type "source-in"
  backctx.fillStyle = "#000000";
	backctx.fillRect(0,0,50,50);
	backctx.fillStyle="#ffffff";
	switch (stimulus) {
		case 0:
			backctx.beginPath();
			backctx.arc(25,25,25,stimTheta-0.1,stimTheta+0.1);
			backctx.arc(25,25,0,stimTheta-0.1,stimTheta+0.1);
			backctx.fill();
			break;
		case 1:
			backctx.beginPath();
			backctx.arc(25,25,stimEcc/10+1,0,Math.PI*2);
			backctx.arc(25,25,stimEcc/10-1,0,Math.PI*2,true);
			backctx.fill();
			break;
		case 2:
			// bars horizontal
			backctx.fillRect(0,Math.round((stimY-boundY[0])/10)-2.5,50,5);
			break;
		case 3:
			backctx.fillRect((Math.round(stimX)/10)-2.5,0,5,50);
			break;
	}
	Sdata = backctx.getImageData(0,0,50,50);

	// 
	var effect = 0;
	for (var i=0;i<2500;i++) {
		effect+=RFdata.data[i*4]/255*Sdata.data[i*4]/255;
	}
	if (activity.length>400) {activity.shift();}
	// effect = activity[activity.length-1]>0 ? effect/Math.log(activity[activity.length-1]) : effect;
	activity.push(effect);
  // console.log(effect);

	bold.shift(); bold.push(0);
	effect = Math.sqrt(effect*50);
	for (var i=0;i<hrf.length;i++) {
		bold[activity.length+i]+=hrf[i]*effect;
	}

}

var activityY = canvas3.height-25;
var activity = [];

function drawActivity() {
	ctx3.strokeStyle = "#6155CD";
	ctx3.beginPath();
	ctx3.moveTo(525,activityY-activity[0]);
	for (var i=1;i<activity.length;i++) {
		ctx3.lineTo(525+i,activityY-activity[i]);
	}
	ctx3.stroke();
	// ctx3.font = "Arial 50px";
	ctx3.fillStyle = "#6155CD";
	ctx3.fillText("Predicted neural activity",530,activityY+15);
}

var boldY = 500;
var bold;

function drawBold() {
	ctx3.strokeStyle = "#5DADE2";
	ctx3.beginPath();
	ctx3.moveTo(525,boldY-bold[0]);
	for (var i=1;i<activity.length;i++) {
		ctx3.lineTo(525+i,boldY-bold[i]);
	}
	ctx3.stroke();
	// ctx3.font = "Arial 50px";
	ctx3.fillStyle = "#5DADE2";
	ctx3.fillText("Predicted bold activity",530,boldY+15);
}

var boundX = [0,500];
var centX = (boundX[1]-boundX[0])/2+boundX[0];
var boundY = [150,650];
var centY = (boundY[1]-boundY[0])/2+boundY[0];

var offset = 0;

var imgWedges = new Image(); imgWedges.src = "images/wedges.png";
var imgRings = new Image(); imgRings.src = "images/rings.png";
var imgBars = new Image(); imgBars.src = "images/bars.png";

var imgX = [0,100,200,200];

function eventClick3(x,y,shift) {
	for (var i=0;i<imgX.length;i++) {
		if (x>imgX[i]&&x<(imgX[i]+100)&&y<100) {
			// we are overlapping img i
			if (i==2 && stimulus==2) {
				stimulus = 3;
        return;
			} else {
				stimulus = i;
			} return;
		}
	}	
	var dist = Math.hypot(x-((boundX[1]-boundX[0])/2+boundX[0]),y-((boundY[1]-boundY[0])/2+boundY[0]));
	if (dist<250) {
		// we are inside the visual field
		rf.x = x;
		rf.y = y;
		rf.sd = 0;
		drag = true;
	}
}

var drag = false;

function mouseUp3() {
	drag = false;
}

var stimTheta = 0;
var stimEcc = 10;
var stimX = 0;
var stimY = 0;

function eventMove3(x,y) {
	stimX = x; stimY = y;
	if (drag) {
		rf.sd = Math.min(100,Math.hypot(x-rf.x,y-rf.y));
	}
	stimTheta = -Math.atan2(x-centX,y-centY)+Math.PI/2;
	stimEcc = Math.max(10,Math.min(240,x%250));//Math.max(Math.min(240,Math.hypot(x-centX,y-centY)),10);
}

////////////////////////////////
////////// END CODE /////////////
////////////////////////////////

function run(i) {	
	$("#continue").show();
	cancelAnimationFrame(tick3);
  cancelAnimationFrame(tick5);
  cancelAnimationFrame(tick7);
	// Runs each time a block starts incase that block has to do startup
	switch(i) {
		case 3:
			eventClick = eventClick3;
			eventMove = eventMove3;
			curCanvas = canvas3;
			canvas3.addEventListener("mousedown",updateCanvasClick,false);
			canvas3.addEventListener("mouseup",mouseUp3,false);
			canvas3.addEventListener("mousemove",updateCanvasMove,false);
			run3();
      if(!done1){$("#continue").hide();}
      
			break;
    case 5:
      stimulus = 1;
      order = [83,85,82,70,65,67,69];
      eventClick = eventClick5;
      eventMove = eventMove5;
      curCanvas = canvas5;
      canvas5.addEventListener("mousedown",updateCanvasClick,false);
      canvas5.addEventListener("mousemove",updateCanvasMove,false);
      run5();
      if(!done2){$("#continue").hide();}
      break;
    case 7:
      eventClick = eventClick7;
      eventMove = eventMove7;
      curCanvas = canvas7;
      drag = false;
      clearField();
      canvas7.addEventListener("mousedown",updateCanvasClick,false);
      canvas7.addEventListener("mouseup",mouseUp3,false);
      canvas7.addEventListener("mousemove",updateCanvasMove,false);
      run7();
      break;
	}
}

function launch_local() {
  document.addEventListener("keydown",key2);
	bold = zeros(400+hrf.length);
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

var eventClick;
var curCanvas;
var eventMove;

function updateCanvasMove(evt) {
  var out = updateCanvas(evt,curCanvas);
  eventMove(out[0],out[1]);
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


function clipCtx(ctx,canvas) {
	ctx.save();
	ctx.beginPath();
	ctx.arc(canvas.width/2,canvas.height/2,canvas.width/2,0,2*Math.PI,false);
	ctx.clip();
}



var hrf = [-0.0167,
   -0.0167,
   -0.0167,
   -0.0167,
   -0.0166,
   -0.0165,
   -0.0162,
   -0.0158,
   -0.0152,
   -0.0143,
   -0.0131,
   -0.0116,
   -0.0097,
   -0.0074,
   -0.0046,
   -0.0015,
    0.0021,
    0.0062,
    0.0106,
    0.0155,
    0.0207,
    0.0262,
    0.0320,
    0.0381,
    0.0444,
    0.0508,
    0.0573,
    0.0639,
    0.0705,
    0.0770,
    0.0835,
    0.0898,
    0.0960,
    0.1019,
    0.1077,
    0.1131,
    0.1182,
    0.1231,
    0.1276,
    0.1317,
    0.1354,
    0.1388,
    0.1418,
    0.1444,
    0.1466,
    0.1484,
    0.1499,
    0.1509,
    0.1516,
    0.1520,
    0.1520,
    0.1516,
    0.1510,
    0.1500,
    0.1488,
    0.1473,
    0.1455,
    0.1435,
    0.1413,
    0.1389,
    0.1363,
    0.1336,
    0.1306,
    0.1276,
    0.1244,
    0.1212,
    0.1178,
    0.1144,
    0.1109,
    0.1074,
    0.1038,
    0.1002,
    0.0966,
    0.0930,
    0.0894,
    0.0858,
    0.0822,
    0.0787,
    0.0751,
    0.0717,
    0.0682,
    0.0649,
    0.0615,
    0.0583,
    0.0551,
    0.0519,
    0.0488,
    0.0458,
    0.0429,
    0.0400,
    0.0372,
    0.0345,
    0.0318,
    0.0292,
    0.0267,
    0.0243,
    0.0219,
    0.0196,
    0.0173,
    0.0152,
    0.0131,
    0.0111,
    0.0091,
    0.0072,
    0.0053,
    0.0036,
    0.0019,
    0.0002,
   -0.0014,
   -0.0029,
   -0.0044,
   -0.0059,
   -0.0072,
   -0.0086,
   -0.0098,
   -0.0111,
   -0.0123,
   -0.0134,
   -0.0145,
   -0.0155,
   -0.0165,
   -0.0175,
   -0.0184,
   -0.0193,
   -0.0202,
   -0.0210,
   -0.0217,
   -0.0225,
   -0.0232,
   -0.0238,
   -0.0245,
   -0.0251,
   -0.0256,
   -0.0262,
   -0.0267,
   -0.0272,
   -0.0276,
   -0.0280,
   -0.0284,
   -0.0288,
   -0.0291,
   -0.0295,
   -0.0298,
   -0.0300,
   -0.0303,
   -0.0305,
   -0.0307,
   -0.0309,
   -0.0310,
   -0.0312,
   -0.0313,
   -0.0314,
   -0.0315,
   -0.0316,
   -0.0316,
   -0.0317,
   -0.0317,
   -0.0317,
   -0.0317,
   -0.0317,
   -0.0316,
   -0.0316,
   -0.0315,
   -0.0315,
   -0.0314,
   -0.0313,
   -0.0312,
   -0.0311,
   -0.0309,
   -0.0308,
   -0.0307,
   -0.0305,
   -0.0304,
   -0.0302,
   -0.0301,
   -0.0299,
   -0.0297,
   -0.0295,
   -0.0293,
   -0.0292,
   -0.0290,
   -0.0288,
   -0.0286,
   -0.0284,
   -0.0282,
   -0.0280,
   -0.0277,
   -0.0275,
   -0.0273,
   -0.0271,
   -0.0269,
   -0.0267,
   -0.0265,
   -0.0263,
   -0.0261,
   -0.0259,
   -0.0256,
   -0.0254,
   -0.0252,
   -0.0250,
   -0.0248,
   -0.0246,
   -0.0244,
   -0.0242,
   -0.0240,
   -0.0238,
   -0.0236,
   -0.0235,
   -0.0233,
   -0.0231,
   -0.0229,
   -0.0227,
   -0.0226,
   -0.0224,
   -0.0222,
   -0.0221,
   -0.0219,
   -0.0217,
   -0.0216,
   -0.0214,
   -0.0213,
   -0.0211,
   -0.0210,
   -0.0209,
   -0.0207,
   -0.0206,
   -0.0205,
   -0.0203,
   -0.0202,
   -0.0201,
   -0.0200,
   -0.0199,
   -0.0198,
   -0.0197,
   -0.0196,
   -0.0195,
   -0.0194,
   -0.0193,
   -0.0192,
   -0.0191,
   -0.0190,
   -0.0189,
   -0.0188,
   -0.0187,
   -0.0187,
   -0.0186,
   -0.0185,
   -0.0184,
   -0.0184,
   -0.0183,
   -0.0182,
   -0.0182,
   -0.0181,
   -0.0181,
   -0.0180,
   -0.0180,
   -0.0179,
   -0.0179,
   -0.0178,
   -0.0178,
   -0.0177,
   -0.0177,
   -0.0176,
   -0.0176,
   -0.0176,
   -0.0175,
   -0.0175,
   -0.0175,
   -0.0174,
   -0.0174,
   -0.0174,
   -0.0173,
   -0.0173,
   -0.0173,
   -0.0173,
   -0.0172,
   -0.0172,
   -0.0172,
   -0.0172,
   -0.0171,
   -0.0171,
   -0.0171,
   -0.0171,
   -0.0171,
   -0.0170,
   -0.0170,
   -0.0170,
   -0.0170,
   -0.0170,
   -0.0170,
   -0.0170,
   -0.0169,
   -0.0169,
   -0.0169,
   -0.0169,
   -0.0169,
   -0.0169,
   -0.0169,
   -0.0169,
   -0.0169,
   -0.0169,
   -0.0168,
   -0.0168,
   -0.0168,
   -0.0168,
   -0.0168,
   -0.0168,
   -0.0168,
   -0.0168,
   -0.0168,
   -0.0168,
   -0.0168,
   -0.0168,
   -0.0168,
   -0.0168,
   -0.0168,
   -0.0168,
   -0.0168,
   -0.0168,
   -0.0168,
   -0.0168,
   -0.0168,
   -0.0167,
   -0.0167,
   -0.0167,
   -0.0167,
   -0.0167,
   -0.0167,
   -0.0167,
   -0.0167,
   -0.0167,
   -0.0167,
   -0.0167,
   -0.0167,
   -0.0167,
   -0.0167,
   -0.0167,
   -0.0167,
   -0.0167];
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167
   // -0.0167];
