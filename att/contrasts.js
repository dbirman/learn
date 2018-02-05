// A drawing package for contrasts

function getStartLocations(center, xDist, yDist, sqSz){
  startLoc = [];
  startLoc[0] = [center[0] - xDist - sqSz, center[1] + yDist];
  startLoc[1] = [center[0] + xDist, center[1] + yDist];
  startLoc[2] = [center[0] + xDist, center[1] - yDist - sqSz];
  startLoc[3] = [center[0] - xDist - sqSz, center[1] - yDist - sqSz];

  return startLoc;
  
}

function initContrastPatch(whichLoc, contrast, canvas){
  var contrasts = {};
  contrasts.screenWidth = canvas.width;
  contrasts.screenHeight = canvas.height;
  contrasts.nBars = 20;
  contrasts.whichLoc = whichLoc;
  contrasts.contrast = contrast;
  contrasts.lowLum = (.50-contrast/2)*255;
  contrasts.highLum = (.50+contrast/2)*255;

  contrasts.xSize = 4;
  contrasts.ySize = contrasts.xSize * contrasts.nBars;
  contrasts.startLoc = getStartLocations([Math.round(contrasts.screenWidth/2), Math.round(contrasts.screenHeight/2)], 100,100, contrasts.ySize)[whichLoc];
  contrasts.x = zeros(contrasts.nBars);
  contrasts.y = zeros(contrasts.nBars);

  for(var i = 0; i<contrasts.nBars; i++){
    contrasts.x[i] = contrasts.startLoc[0]+i*contrasts.xSize;
    contrasts.y[i] = contrasts.startLoc[1];
  }

  return contrasts;
}

function drawContrasts(contrasts,ctx) {
  for (var i = 0; i < contrasts.nBars; i++){
    whichColor = i%2;
    switch(whichColor){
      case 0:
        lum = Math.round(contrasts.lowLum);
        break;
      case 1:
        lum = Math.round(contrasts.highLum);
        break;
    } 
    ctx.fillStyle = "rgb(" + lum + "," + lum + "," + lum + ")";
    ctx.fillRect(contrasts.x[i], contrasts.y[i], contrasts.xSize, contrasts.ySize);
  }
}

function drawBoxes(contrasts1, contrasts2, contrasts3, contrasts4){
  ctx.fillStyle="rgb(0,0,0)";
  ctx.lineWidth = 4;
  ctx.strokeRect(contrasts1.x[0], contrasts1.y[0], contrasts1.ySize, contrasts1.ySize);
  ctx.strokeRect(contrasts2.x[0], contrasts2.y[0], contrasts2.ySize, contrasts2.ySize);
  ctx.strokeRect(contrasts3.x[0], contrasts3.y[0], contrasts3.ySize, contrasts3.ySize);
  ctx.strokeRect(contrasts4.x[0], contrasts4.y[0], contrasts4.ySize, contrasts4.ySize);
}

function initCues(canvas){
  centers = [Math.round(canvas.width/2), Math.round(canvas.height/2)];
  var cues = {};
  cues.p2 = [];
  cues.p1 = centers;
  cues.p2[0] = [centers[0]-20, centers[1]+20];
  cues.p2[1] = [centers[0]+20, centers[1]+20];
  cues.p2[2] = [centers[0]+20, centers[1]-20];
  cues.p2[3] = [centers[0]-20, centers[1]-20];
  return cues
}

function drawCue(cues, isFocal, whichLoc, ctx){

  if(! isFocal){
    for (i=0; i<4; i++){
      canvas_arrow(ctx, cues.p1[0], cues.p1[1], cues.p2[i][0], cues.p2[i][1]);
    }
  } else{
    canvas_arrow(ctx, cues.p1[0], cues.p1[1], cues.p2[whichLoc][0], cues.p2[whichLoc][1]);
  }
}

function drawFeedback(correct, canvas, ctx){
  centers = [Math.round(canvas.width/2), Math.round(canvas.height/2)];
  xsz = 9;
  off = Math.floor(xsz/2);
  
  if ( correct ){
    ctx.fillStyle= "green";
  } else {
    ctx.fillStyle = "red";
  }
  ctx.fillRect(centers[0] - off, centers[1] - off, xsz, xsz);
}

function canvas_arrow(context, fromx, fromy, tox, toy){
    var headlen = 15;   // length of head in pixels
    var angle = Math.atan2(toy-fromy,tox-fromx);
    context.beginPath();
    context.moveTo(fromx, fromy);
    context.lineWidth = 3;
    context.lineTo(tox, toy);
    context.lineTo(tox-headlen*Math.cos(angle-Math.PI/6),toy-headlen*Math.sin(angle-Math.PI/6));
    context.moveTo(tox, toy);
    context.lineTo(tox-headlen*Math.cos(angle+Math.PI/6),toy-headlen*Math.sin(angle+Math.PI/6));
    context.stroke();
}

function arrow (p1, p2, size) {
  var angle = Math.atan2((p2[1] - p1[1]) , (p2[0] - p1[0]));
  var hyp = Math.sqrt((p2[0] - p1[0]) * (p2[0] - p1[0]) + (p2[1] - p1[1]) * (p2[1] - p1[1]));

  ctx.save();
  ctx.translate(p1.x, p1.y);
  ctx.rotate(angle);

  // line
  ctx.beginPath();  
  ctx.moveTo(0, 0);
  ctx.lineTo(hyp - size, 0);
  ctx.stroke();

  // triangle
  ctx.fillStyle = 'blue';
  ctx.beginPath();
  ctx.lineTo(hyp - size, size);
  ctx.lineTo(hyp, 0);
  ctx.lineTo(hyp - size, -size);
  ctx.fill();

  ctx.restore();
}

function cartesian() {
    var r = [], arg = arguments, max = arg.length-1;
    function helper(arr, i) {
        for (var j=0, l=arg[i].length; j<l; j++) {
            var a = arr.slice(0); // clone arr
            a.push(arg[i][j]);
            if (i==max)
                r.push(a);
            else
                helper(a, i+1);
        }
    }
    helper([], 0);
    return r;
}

function getRandomSubarray(arr, size) {
    var shuffled = arr.slice(0), i = arr.length, temp, index;
    while (i--) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(0, size);
}

