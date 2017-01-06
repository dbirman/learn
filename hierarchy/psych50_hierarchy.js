// Spiking variables
var spk_rate = 2;
var spk = zeros(200);
// Image
var pixReduction = 4; // how many pixels = 1 pixel for calculations
// Even a reduction by a factor of 2 makes a HUGE difference for 
// speed of calculations, and there's really no appreciable difference
// for the quality of the output
var imageData; // this is the current image data REDUCED
var imageDataRound; // for checking against clicked locations
var imageDataRaw; // keep this around so we can re-draw the RF later
// Receptive field
var rf;
var x0,y0,x0r,y0r; // center of receptive field
var rf_size;
var computeRF; // function set for each run 
var correctCount = 0;
// Stimulus parameters
var size;
var sizeOut;
var sizeOutText;
var rotation;
var rotationOut;
var rotationOutText;
var drawStimulus; // draw function called by update()
//  - Circles: adjusts radius
//  - Bars: adjusts length
var theta;
var thetaOut;

// Visual canvas
var can_vis;
var can_out;
var cursorPosRaw = [-10,-10];
var cursorPos = [-10,-10]; // REDUCED POSITION-- NOT REAL
var updateBlock;
// Contexts
var ctx_vis;
var ctx_out;
// requestAnimationFrame 
var tick;
var isDone;

////////////////////
///// BLOCK 5 //////
////////////////////

$("#textarea5").keydown(function(event) {textarea5(event)});

function textarea5(e) {
  var key = e.which;
  if (key===13) {
    e.preventDefault();
    if (document.getElementById('textarea5').value.indexOf('rgc') !== -1) {
      // $("#end9").show();
      sectionComplete();
    }
  }
}


var done3 = false;

function launch3() {
  can_vis = document.getElementById("visual1");
  can_out = document.getElementById("output1");
  ctx_vis = can_vis.getContext("2d");
  ctx_out = can_out.getContext("2d");

  can_vis.addEventListener("click",updateCanvasClick,false);
  can_vis.eventClick = eventClick;
  can_vis.addEventListener("mousemove",updateCanvasMove,false);
  can_vis.eventMove = eventMove;

  sizeOut = document.getElementById("size1");
  sizeOutText = "radius=";

  updateBlock = updateBlockGen;
  computeRF = computeRF3;

  isDone = function() {return done3;}
  checkDone = checkDone3;
  drawStimulus = drawStimulus3;
  // Launch
  addRGCrf();

  changeSize(2); // initial size
  drawBlock();
  spike();
}

function end3() {
  done3 = true;
  $("#textarea5").show();
  $("#endblock3").show();
}

function checkDone3() {
  if (!done3 && correctCount>15 && clickListPos.length>3 && clickListNeg.length>3) {end3();}
  console.log(correctCount);
}

// Visual variables
var clickListPos = [];
var clickListNeg = [];

function computeRF3() {
  var rad = size/pixReduction, diam=rad*2;
  rf = zeros(pow(diam,2)[0]);
  for (var x=0;x<diam;x++) {
    for (var y=0;y<diam;y++) {
      var dist = Math.hypot(x-rad,y-rad);
      rf[y*diam+x] = (dist<rad) ? 1 : 0;
    }
  }
}

function drawStimulus3() {
  ctx_vis.beginPath();
  ctx_vis.arc(cursorPosRaw[0], cursorPosRaw[1], size*2, 0, 2 * Math.PI, false);
  ctx_vis.fillStyle = "rgba(255,255,255,0.5)";
  ctx_vis.fill();
}

////////////////////
///// BLOCK 7 //////
////////////////////

$("#textarea7").keydown(function(event) {textarea7(event)});

function textarea7(e) {
  var key = e.which;
  if (key===13) {
    e.preventDefault();
    if (document.getElementById('textarea7').value.indexOf('simplecells') !== -1) {
      // $("#end9").show();
      sectionComplete();
    }
  }
}

var done7 = false;

function launch7() {
  can_vis = document.getElementById("visual7");
  can_out = document.getElementById("output7");
  ctx_vis = can_vis.getContext("2d");
  ctx_out = can_out.getContext("2d");

  can_vis.addEventListener("click",updateCanvasClick,false);
  can_vis.eventClick = eventClick;
  can_vis.addEventListener("mousemove",updateCanvasMove,false);
  can_vis.eventMove = eventMove;

  sizeOut = document.getElementById("size7");
  sizeOutText = "length=";
  rotationOut = document.getElementById("rotation7");
  rotationOutText="rotation=";

  updateBlock = updateBlockGen;
  isDone = function() {return done7;}

  correctCount = 0; clickListPos = []; clickListNeg = [];

  computeRF = computeRF7;
  // only change after compute is set
  changeSize(12); // initial size
  changeRotation(0);

  checkDone = checkDone7;
  drawStimulus = drawStimulus7;
  // Launch
  addSCrf();

  drawBlock();
  spike();
}

function end7() {
  done7 = true;
  $("#endblock7").show();
  $("#textarea7").show();
}

function checkDone7() {
  if (!done7 && correctCount>15 && clickListPos.length>3 && clickListNeg.length>3) {end7();}
}

// Visual variables
var clickListPos = [];
var clickListNeg = [];

function computeRF7() {
  // Build the receptive field--this is square, min size is
  // the diagonal of the stimulus size. Use rotatePoint to
  // build stimulus at the correct angle.

  // ctxt.clearRect(0,0,canvast.width,canvast.height);

  var diam = Math.round(size/pixReduction*1.5*2);
  var rad = diam/2;
  rf = zeros(pow(diam,2)[0]);
  for (var x=0;x<diam;x++) {
    for (var y=0;y<diam;y++) {
      var rot = rotatePoint(x,y,rad,rad,rotation*Math.PI/180);
      var ydist = Math.abs(rot[1]-rad);
      rf[y*diam+x] = (ydist<(diam/1.5/pixReduction/2)) ? 1 : 0;
      // ctxt.fillStyle = gsc2hex(rf[y*diam+x]);
      // ctxt.fillRect(x*pixReduction,y*pixReduction,pixReduction,pixReduction);
    }
  }

}

function drawStimulus7() {
  // draw a rotated bar
  ctx_vis.save();
  ctx_vis.translate(cursorPosRaw[0],cursorPosRaw[1]);
  ctx_vis.rotate(-rotation*Math.PI/180);
  ctx_vis.fillStyle = "rgba(255,255,255,0.5)";
  var lsize = size*1.5;
  ctx_vis.fillRect(-lsize,-size/4,lsize*2,size/2);
  ctx_vis.restore();
}

//////////////////////
///// BLOCK 8  ///////
//////////////////////

function bonus1() {$("#bonus1").show();}

function drawPlot8() {
  var f = 0.25; 
  var sigma = 2; // largeish sigma
  var theta = 0; // no phase offset

  var x = divide(range(-50,101),10);

  traceS = {
    x: x,
    y: cos(subtract(multiply(2*Math.PI*f,x),theta)),
    mode:'line',
    line:{color:'black'},
    type:'scatter',
    name:'Sinusoid'
  }
  traceG = {
    x: x,
    y: pow(Math.exp(1),multiply(-1,divide(pow(x,2),multiply(2,pow(sigma,2))[0]))),
    mode:'line',
    line: {color:'white'},
    type:'scatter',
    name:'Gaussian'
  }
  traceM = {
    x: x,
    y: subtract(mexicanHat(x,f,sigma,theta),0.5),
    mode:'line',
    marker: {color:'red'},
    type:'scatter',
    name:'Mexican hat'
  }
  var layout1 = layout;
  layout1.title = 'Building a single cell model';
  layout1.xaxis.title = 'Position (a.u.)';
  layout1.xaxis.range = [-5,5];
  layout1.yaxis.title = 'Response (a.u.)';
  layout1.yaxis.range = [-1,1];
  layout1.width = 600;
  layout1.height = 400;
  Plotly.newPlot('plot1',[traceS,traceG,traceM],layout1);
}

//////////////////////
///// BLOCK 9  ///////
//////////////////////

$("#textarea9").keydown(function(event) {textarea9(event)});

function textarea9(e) {
  var key = e.which;
  if (key===13) {
    e.preventDefault();
    if (document.getElementById('textarea9').value.indexOf('trickquestion') !== -1) {
      $("#end9").show();
      $("#continue").show();
    }
  }
}

var respOffset = [];

function launch9() {
  can_vis = document.getElementById("visual9");
  can_out = document.getElementById("output9");
  ctx_vis = can_vis.getContext("2d");
  ctx_out = can_out.getContext("2d");

  can_vis.addEventListener("click",updateCanvasClick,false);
  can_vis.eventClick = eventClick;
  can_vis.addEventListener("mousemove",updateCanvasMove,false);
  can_vis.eventMove = eventMove;

  sizeOut = document.getElementById("position9");
  sizeOutText = "offset=";
  rotationOut = document.getElementById("rotation9");
  rotationOutText="rotation=";

  isDone = function() {return false;} // they type in a code from the TA

  correctCount = 0; clickListPos = []; clickListNeg = [];

  updateBlock = updateBlock9;

  computeRF = computeRF7;
  // only change after compute is set
  changeSize(0); // initial size
  changeRotation(0);

  checkDone = function() {return false;}; // they type in a code from the TA
  drawStimulus = drawStimulus9;
  
  preCompute();

  // Launch
  drawBlock();
  spike();
}

var preCompVals;

function preCompute() {
  // Precompute values for block 9
  var vals = range(-8,17);
  var maxDir = Math.floor(Math.random()*4);
  var oppDir = (maxDir+2) % 4;
  var oDir1 = (maxDir+1) % 4;
  var oDir2 = (maxDir+3) % 4;

  // 4 directions, with +- 8 values, centered at zero
  preCompVals = createArray(4,17);
  preCompVals[maxDir] = [0,0,-0.1,1,1,1,1,1,1,1,1,1,1,1,-0.1,0,0];
  preCompVals[oppDir] = [0,0,-0.1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-0.1,0,0];
  preCompVals[oDir1] = zeros(17);
  preCompVals[oDir2] = zeros(17);
}

function updateBlock9() {
  // In block 9 we don't actuall compute the receptive field
  // we just check the stimulus position and use this
  // 
  lsize = size/20;
  lrot = rotation/45;

  var val = preCompVals[lrot][lsize+8]*10 + preCompVals[lrot][lsize+8]*randn()*5;
  
  updateSpikeRate(val*10);
}

function drawStimulus9() {
  // draw a rotated bar
  ctx_vis.save();
  ctx_vis.translate(can_vis.width/2,can_vis.height/2);
  ctx_vis.rotate(-rotation*Math.PI/180);
  ctx_vis.translate(0,size);
  ctx_vis.fillStyle = "rgba(255,255,255,0.5)";
  var lsize = 48;
  ctx_vis.fillRect(-100,-15,200,30);
  ctx_vis.restore();
}

//////////////////////
///// CIFAR-10 ///////
//////////////////////

// This code is based on: https://cs.stanford.edu/people/karpathy/convnetjs/demo/cifar10.html

var classes = ['0','1','2','3','4','5','6','7','8','9'];
// var num_batches = 1; // 20 training batches, 1 test
// var data_img_elts = new Array(num_batches);
// var img_data = new Array(num_batches);
// var loaded = new Array(num_batches);
// var loaded_train_batches = [];
var net;

// Load a single batch
// var load_data_batch = function(batch_num) {
//   // Load the dataset with JS in background
//   data_img_elts[batch_num] = new Image();
//   var data_img_elt = data_img_elts[batch_num];
//   data_img_elt.onload = function() { 
//     var data_canvas = document.createElement('canvas');
//     data_canvas.width = data_img_elt.width;
//     data_canvas.height = data_img_elt.height;
//     var data_ctx = data_canvas.getContext("2d");
//     data_ctx.drawImage(data_img_elt, 0, 0); // copy it over... bit wasteful :(
//     img_data[batch_num] = data_ctx.getImageData(0, 0, data_canvas.width, data_canvas.height);
//     loaded[batch_num] = true;
//     loaded_train_batches.push(batch_num);
//     console.log('finished loading data batch ' + batch_num);
//   };
//   data_img_elt.src = "convnetjs/images/cifar10_batch_" + batch_num + ".png";
// }

//Load the pretrained network
var load_pretrained = function() {
  $.getJSON("convnetjs/mnist_snapshot.json", function(json){
    net = new convnetjs.Net();
    net.fromJSON(json);
  });
}

// var get_image = function() {
//   // pick a batch
//   var bi = Math.floor(Math.random()*loaded_train_batches.length);
//   // get the num of the batch
//   var b = loaded_train_batches[bi];
//   // sample within the batch
//   var k = Math.floor(Math.random()*1000);
//   // actual position in labels
//   var n = b*1000+k;

//   var p = img_data[0].data;
//   var data = zeros(3072);

//   for(var xc=0;xc<32;xc++) {
//     for(var yc=0;yc<32;yc++) {
//       for (var dc=0;dc<4;dc++) {
//         var i = yc*32*4+xc*4; // position in the image
//         // var i = yc*32*4
//         data[i+dc] = p[k*4096+i+dc];
//       }
//     }
//   }

//   return {data:data, label:labels[n]};

// }

function launch_conv() {
  can_conv.addEventListener("mousedown",updateCanvasClick,false);
  can_conv.eventClick = eventClick_conv;
  can_conv.addEventListener("mousemove",updateCanvasMove,false);
  can_conv.eventMove = eventMove_conv;
  can_conv.addEventListener("mouseup",removeClick,false);


  load_pretrained();
  // load_data_batch(0);

  // new_mix();

  waitForLoad();
}

// function new_mix() {
//   document.getElementById("mix").src = "images/mix" + Math.ceil(Math.random()*6) + ".jpg";
// }

function waitForLoad() {
  // if (!loaded[0] || !net) {
  //   setTimeout(waitForLoad,50);
  // } else {
    // a = get_image();
    // out = net.forward(a);

  reset_image();
  draw_conv();
  // }
}

function draw_conv() {
  tick = window.requestAnimationFrame(draw_conv);

  ctx_conv.clearRect(0,0,can_conv.width,can_conv.height);
  ctx_conv.fillStyle = "#000000";
  ctx_conv.fillRect(0,0,can_conv.width,can_conv.height);
  ctx_conv.putImageData(conv_imgData,0,0);

  var x = Math.floor(cursorPosRaw[0]);
  var y = Math.floor(cursorPosRaw[1]);

  ctx_conv.fillStyle = "rgba(128,128,128,1)";
  ctx_conv.fillRect(x,y,1,1);
}

var can_conv = document.getElementById("conv_canvas");
var ctx_conv = can_conv.getContext("2d");
var conv_imgData = ctx_conv.createImageData(can_conv.width,can_conv.height);

var img_xs;
var img_ys;

function reset_image() {
  for (var i=0;i<(24*24);i++) {
    for (var dc=0;dc<3;dc++) {
      conv_imgData.data[i*4+dc] = 0;
    }
    conv_imgData.data[i*4+3] = 255;
  }
  // We'll pick 5 random images and stick them in the canvas
  // var pixels = can_conv.width*can_conv.height;
  // for (var i=0; i<pixels;i++) {
  //   for (var dc=0;dc<3;dc++) {
  //     var val = Math.random()*255;
  //     conv_imgData.data[i*4+dc] = (val>0)?(val<255?val:255):0;
  //   }
  //   conv_imgData.data[i*4+3] = 255;
  // }

  // img_xs = zeros(10);
  // img_ys = zeros(10);

  // for (var i=0; i<5; i++) {
  //   var img = get_image();

  //   // pick an x/y coordinate 
  //   img_xs[i] = Math.round((Math.random()*.8+0.05)*can_conv.width);
  //   img_ys[i] = Math.round((Math.random()*.8+0.05)*can_conv.height);

  //   for (var x=0;x<32;x++) {
  //     for (var y=0;y<32;y++) {
  //       var can_pos = (img_ys[i]+y)*can_conv.width*4+(img_xs[i]+x)*4; // position on canvas
  //       var img_pos = 4*(y*32+x); // position in img
  //       for (var j=0;j<4;j++) {
  //         conv_imgData.data[can_pos+j] = img.data[img_pos+j]; //Math.min(Math.max(img.data[img_pos+j]+randn()*25,0),255);
  //       }
  //     }
  //   }
  // }
}

function eventMove_conv(x,y) {
  // xlim = 255-32; ylim = 255-32;
  // x = x>xlim ? x=xlim : x;
  // y = y>ylim ? y=ylim : y;
  cursorPosRaw = [x,y];
  x = Math.floor(x), y = Math.floor(y);
  see_image(x,y);
  if (down) {
    for (var j=0;j<3;j++) {conv_imgData.data[4*(y*24+x)+j] = 255;}
  }
}

var down = false;

function eventClick_conv(x,y,shift) {
  down = true;
  x = Math.floor(x), y = Math.floor(y);
  if (shift) {reset_image();}
  else {
    // Whiten position
    for (var j=0;j<3;j++) {conv_imgData.data[4*(y*24+x)+j] = 255;}
  }
  see_image();
}

function removeClick() {down=false;}

// var cant = document.getElementById("conv_view");
// var ctxt = cant.getContext("2d");

var conv_out;

function see_image(x,y) {
  // ctxt.clearRect(0,0,cant.width,cant.height);

  dat = new convnetjs.Vol(24,24,1,0.0);
  for (var i=0;i<(24*24);i++) {
    dat.w[i] = conv_imgData.data[i*4];
  }
  // for(var x=0;x<24;x++) {
  //   for(var y=0;y<24;y++) {
  //     var val = conv_imgData.data[4*(y*24+x)];
  //     dat.set(y,x,1,val/255);
  //   }
  // }

  conv_out = net.forward(dat);

  var oclass = findMaxIndex(conv_out.w);
  var oclass2 = findSecondMaxIndex(conv_out.w);

  document.getElementById("conv_out").innerHTML = "I see a <b>" + classes[oclass] +"</b>";
}

// Run on an image

////////////////////
///// SHARED ///////
////////////////////

function updateBlockGen() {
  var rad = Math.sqrt(rf.length); // should always be square
  var curData = zeros(rf.length); var count = 0;
  var win_xy = [Math.round(cursorPos[0]-rad/2),Math.round(cursorPos[1]-rad/2)];
  for (var y=win_xy[1];y<win_xy[1]+rad;y++) {
    for (var x=win_xy[0];x<win_xy[0]+rad;x++) {
      curData[count++] = imageData[y*can_vis.width/pixReduction+x];
    }
  }
  var val = 0;
  for (var i=0;i<curData.length;i++) {
    if (!isnan(curData[i]) && !isnan(rf[i])) {
      val+=curData[i]*rf[i];
    }
  }
  updateSpikeRate(val);
}

function updateSpikeRate(val) {
  spk_rate = 3 + val*2;
  if (spk_rate<0) {spk_rate=0;}
}

function eventClick(x,y,shift) {
  // get current pos
  var x = Math.floor(x/pixReduction), y = Math.floor(y/pixReduction);

  if (shift) {
    // Deal with negatives
    for (var i=0;i<clickListNeg.length;i++) {
      if (clickListNeg[i][0]==x && clickListNeg[i][1]==y) {
        // FOUND IN LIST
        if (imageDataRound[y*100+x]==-1) {correctCount--;}
        clickListNeg.splice(i,1); checkDone(); return;
      }
    }
    
    // NOT IN LIST, ADD
    if (imageDataRound[y*100+x]==-1) {correctCount++;}
    clickListNeg.push([x,y]); checkDone(); return;

  } 
  else {
    for (var i=0;i<clickListPos.length;i++) {
      if (clickListPos[i][0]==x && clickListPos[i][1]==y) {
          // FOUND IN LIST
        if (imageDataRound[y*100+x]==1) {correctCount--;}
        clickListPos.splice(i,1); checkDone(); return;
      }
    }
      
    // NOT IN LIST, ADD
    if (imageDataRound[y*100+x]==1) {correctCount++;}
      clickListPos.push([x,y]); checkDone(); return;
  }
}

function eventMove(x,y) {
  cursorPosRaw = [x,y];
  cursorPos = [Math.floor(x/pixReduction),Math.floor(y/pixReduction)];
}

function updateVisual() {
  if (!isDone()) {
    // draw clicks
    for (var i=0;i<clickListNeg.length;i++) {   
      drawCross(clickListNeg[i][0]*pixReduction,clickListNeg[i][1]*pixReduction,false,"#CD6155"); 
    }
    for (var i=0;i<clickListPos.length;i++) {
      drawCross(clickListPos[i][0]*pixReduction,clickListPos[i][1]*pixReduction,true,"#55CD61");
    }
  } 
  else {
    // show true RF
    drawRawRF(ctx_vis,can_vis);
  }
  // draw cursor (over everything)
  drawStimulus();
  // draw outer edge
  ctx_vis.beginPath();
  ctx_vis.arc(can_vis.width/2,can_vis.height/2,can_vis.width/2-1, 0, 2 * Math.PI, false);
  ctx_vis.strokeStyle = "#ffffff";
  ctx_vis.stroke();
}

function drawBlock() {
  tick = window.requestAnimationFrame(drawBlock);

  updateBlock();
  // Clear contexts
  ctx_vis.clearRect(0,0,can_vis.width,can_vis.height);
  ctx_out.clearRect(0,0,can_out.width,can_out.height);
  // Block visual context + update
  clipCtx(ctx_vis,can_vis);
  updateVisual();
  ctx_vis.restore();
  // Update output context
  ctx_out.strokeStyle = "#CD6155"; // low saturation red
  ctx_out.beginPath();
  ctx_out.moveTo(0,can_out.height-20-spk[0])
  for (var i=1;i<spk.length;i++) {
    ctx_out.lineTo(i,can_out.height-20-spk[i]);
  }
  ctx_out.stroke();
}

////////////////////
///// HELPERS //////
////////////////////

document.addEventListener("keydown",clearLists,false);

function clearLists(e) {
  var key = e.which;
  if (key==32) {
    clickListPos = [];
    clickListNeg = [];
    correctCount = 0;
  }
}


function drawCross(x,y,cross,color) {
  ctx_vis.beginPath();
  ctx_vis.strokeStyle = color;
  ctx_vis.moveTo(x-3,y);
  ctx_vis.lineTo(x+3,y);
  if (cross) {
    ctx_vis.moveTo(x,y-3);
    ctx_vis.lineTo(x,y+3);
  } 
  ctx_vis.stroke();
}

function changeSize(nSize) {
  size = nSize*pixReduction;
  sizeOut.innerHTML = sizeOutText+size+"px";
  // Recompute the RF based on this new radius
  computeRF();
}

function changeRotation(nRotation) {
  rotation = nRotation;
  rotationOut.innerHTML = rotationOutText+rotation+"deg";
  computeRF();
}

function mexicanHat(x,f,sigma,theta) {
  // technically there's an x0 but we set it to 0 here
  // gaussian window * sin wave
  return add(0.5,multiply(0.5,multiply(pow(Math.exp(1),multiply(-1,divide(pow(x,2),multiply(2,pow(sigma,2))[0]))),cos(subtract(multiply(2*Math.PI*f,x),theta))))); 
}

function findSecondMaxIndex(arr) {
  var maxi = findMaxIndex(arr);
  arr[maxi] = -Infinity;
  return findMaxIndex(arr);
}

function mexicanHat2d(x,dist,f,sigma,theta) {
  return add(0.5,multiply(0.5,multiply(pow(Math.exp(1),multiply(-1,divide(pow(dist,2),multiply(2,pow(sigma,2))[0]))),cos(subtract(multiply(2*Math.PI*f,x),theta))))); 
}

function drawRawRF_test(ctx,canvas) {
  for (var x=0;x<canvas.width;x++) {
    for (var y=0;y<canvas.width;y++) {
      var val = imageDataRaw[y*400+x];
      if (!(val==128)) {
        ctx.fillStyle = gsc2hex(val/255);
        ctx.fillRect(x,y,1,1);
      }
    }
  }
}

function drawRawRF(ctx,canvas) {
  for (var x=0;x<canvas.width/pixReduction;x+=2) {
    for (var y=0;y<canvas.width/pixReduction;y+=2) {
      if (imageDataRound[y*100+x]==1) {
        // draw +
        drawCross(x*pixReduction,y*pixReduction,true,"#55CD61"); 
      } else if (imageDataRound[y*100+x]==-1) {
        drawCross(x*pixReduction,y*pixReduction,true,"#CD6155"); 
      }
    }
  }
}

function getImage(ctx,canvas,flag) {
  var adata = ctx.getImageData(0,0,canvas.width,canvas.height).data;
  var data = zeros(adata.length/4);
  // we ignore alpha
  for (var i=0;i<data.length;i++) {
    data[i] = adata[i*4];
  }
  if (!flag) {return data;}
  var dataRed = zeros(data.length/(pow(pixReduction,2)[0]));
  // the last thing we have to do is reduce the quality by our factor
  for (var x=0;x<(canvas.width/pixReduction);x++) {
    for (var y=0;y<(canvas.height/pixReduction);y++) {
      // we could pre-save the size but that would be a hassle
      // also this isn't that slow (in theory)
      var ldata = [];
      // get the x position on the original canvas
      var xd_ = x*pixReduction, yd_ = y*pixReduction;
      for (var xd=xd_;xd<xd_+pixReduction;xd++) {
        for (var yd=yd_;yd<yd_+pixReduction;yd++) {
          ldata.push(data[yd*canvas.width+xd]);
        }
      }
      dataRed[y*(canvas.width/pixReduction)+x] = mean(ldata)
    }
  }
  return dataRed;
}

var stick;
var spike_false = [0,0,0,0,0];
var spike_true = [5,50,-10,-5,-2];

function spike() {
  // run again
  stick = setTimeout(spike,5);
  //
  prob = spk_rate/200; // estimate is that average tick is actually 5 ms
  if (Math.random() < prob) {
    spikes[cur].play();
    cur += 1; if(cur>39){cur=0;}
    for (var i=0;i<5;i++) {spk.shift(); spk.push(spike_true[i]+randn()*2);}
  } else {
    for (var i=0;i<5;i++) {spk.shift(); spk.push(spike_false[i]+randn()*2);}
  }
}

function poisson(avg) {
  // Returns the probability of a spike at any time t, given an average
  // rate of spiking and a time interval
}

function run(i) {
  clearTimeout(stick);
  window.cancelAnimationFrame(tick);
  // start tracking time
  prev_tick = now();

  // reset hidden
  $("#continue").show();

  correctCount = 0;

  switch (i) {
    case 5:
      if (!done3) {
        launch3();
        $("#continue").hide();
        $("#endblock3").hide();
        $("#textarea5").hide();
      }
      break;
    case 7:
      if (!done7) {
        launch7();
        $("#continue").hide();
        $("#endblock7").hide();
        $("#textarea7").hide();
      }
      break;
    case 8:
      $("#bonus1").hide();
      drawPlot8();
      break;
    case 9:
      launch9();
      $("#continue").hide();
      $("#end9").hide();
      break;
    case 11:
      launch_conv();
      break;
  }
}

function launch_local() {
  completeSound = new Audio("sounds/secretsound.mp3");
  spikes = [];
  for (var i=0;i<50;i++) {
    spikes.push(new Audio("sounds/spike.wav"));
  }
  cur = 0; 
  katex.render("out=f(in)",document.getElementById("katex1"),{displayMode:true});
}

function updateCanvas(evt,canvas) {
  var rect = canvas.getBoundingClientRect(), // abs. size of element
    scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for X
    scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y

  var x =  (evt.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
    y =  (evt.clientY - rect.top) * scaleY     // been adjusted to be relative to element
  return [x,y];
}

function updateCanvasMove(evt) {
  var canvas = evt.target;
  var out = updateCanvas(evt,canvas);
  canvas.eventMove(out[0],out[1]);
}

function updateCanvasClick(evt) {
  evt.preventDefault();
  var canvas = evt.target;
  var out = updateCanvas(evt,canvas);
  canvas.eventClick(out[0],out[1],evt.shiftKey);
}

function sectionComplete() {
  // completeSound.play();
  // mark that this section is complete (so it doesn't restart if we come back)
  $("#continue").show();
}

function rotatePoint(x,y,xo,yo,angle) {
  var cos = Math.cos(angle),
    sin = Math.sin(angle),
    dX = x - xo,
    dY = y - yo;

  return [cos * dX - sin * dY + xo,sin * dX + cos * dY + yo];
}

////////////////////
///// RECEPTIVE //////
////////////////////

////////////////////
///// FIELD //////
////////////////////

////////////////////
///// FUNCTIONS //////
////////////////////

function pickRFCenter() {
  // pick an x y coordinate to center at
  x0 = Math.random() * can_vis.width;
  y0 = Math.random() * can_vis.height;
  while (Math.hypot(x0-can_vis.width/2, y0-can_vis.height/2)>(can_vis.width/2-50)) {
    x0 = Math.random() * can_vis.width;
    y0 = Math.random() * can_vis.height;
  }
  x0r = Math.floor(x0/pixReduction);
  y0r = Math.floor(y0/pixReduction);
}

function pullData() {
  // Now we get the image data
  // Note that rescale the imageData into the [-1 1] space
  // This is so that when we do firing rates later and things
  // work out nicely.
  imageDataRaw = getImage(ctx_vis,can_vis,false);
  imageData = getImage(ctx_vis,can_vis,true);

  for (var i=0;i<imageData.length;i++) {
    imageData[i] = imageData[i]/128-1;
  }
  imageDataRound = zeros(imageData.length);
  for (var i=0;i<imageDataRound.length;i++) {
    imageDataRound[i] = (imageData[i]>0.02)?1:((imageData[i]<-0.02)?-1:0);
  }
}

function addSCrf() {
  // Sets up the simple cell receptive field
  // see RGCrf for technical detials

  // The SC receptive field is a gaussian windowed
  // mexican hat function in *one dimension*
  pickRFCenter();

  // clear context to grey
  ctx_vis.fillStyle = "#808080";
  ctx_vis.fillRect(0,0,can_vis.width,can_vis.height);
  // pick an angle for the receptive field
  var angle = Math.floor(Math.random()*9)/4*Math.PI;
  //
  var f = 0.015; 
  var sigma = 25; // largeish sigma
  var theta = Math.PI/2; // no phase offset
  // To run the algorithm we compute for every x,y coordinate a rotated
  // coordinate around the point x0,y0
  for (var x=0;x<can_vis.width;x++) {
    for (var y =0;y<can_vis.height;y++) {
      var dist = Math.hypot(x-x0,y-y0);
      if (dist<75) {
        // note: rotates around x0,y0, -angle so that it doesn't go backwards
        var rot = rotatePoint(x,y,x0,y0,angle); 
        var gsc = mexicanHat2d(rot[0]-x0,dist,f,sigma,theta);
        ctx_vis.fillStyle = gsc2hex(gsc);
        ctx_vis.fillRect(x,y,1,1);
      }
      else {
        ctx_vis.fillStyle = "#808080";
        ctx_vis.fillRect(x,y,1,1);
      }
    }
  }
  // get imageData, raw, round
  pullData();
}

function addRGCrf() {
  // Sets up the retinal ganglion cell receptive field
  // we do this by drawing quickly on the canvas the retinal
  // ganglion cell RF, and then using getImageData to recover
  // what the image looks like (gray everywhere, except at 
  // areas where there is excitatory/inhibitory activity).
  // Finally we reduce the resolution of the image by the pixReduction
  // factor, and re-scale into the [0 1] space.

  // The RGC receptive field is a gaussian windowed
  // mexican hat function in *zero dimensions*
  pickRFCenter();
  // clear context to grey
  ctx_vis.fillStyle = "#808080";
  ctx_vis.fillRect(0,0,can_vis.width,can_vis.height);
  // we will use the mexican hat function (gaussian windowed sin wave)
  // based on the hypotenuse distance from x,y coordinates
  rf_size = 100/pixReduction; // how far to do the test coordinate region
  var f = 0.1; 
  var sigma = 2.5; // largeish sigma
  var theta = 0; // no phase offset
  var xRange = divide(range(0,101),10);
  var outRange = mexicanHat(xRange,f,sigma,theta);
  for (var x=0;x<can_vis.width;x++) {
    for (var y =0;y<can_vis.height;y++) {
      var dist = Math.hypot(x-x0,y-y0);
      if (dist<75) {
        var i=0;
        while (i<dist) {i+=1;}
        ctx_vis.fillStyle = gsc2hex(Math.round(outRange[i]*1000)/1000);
        ctx_vis.fillRect(x,y,1,1);
      } else {
        ctx_vis.fillStyle = "#808080";
        ctx_vis.fillRect(x,y,1,1);
      }
    }
  }
  // get imageData, raw, round
  pullData();
}