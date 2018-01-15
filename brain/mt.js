// TODO:
// don't erase markers when switching from MT to LIP
// noisy condition
// slow down noise
// fix various bugs (LIP renders randomly? Electrodes traces don't go away? Etc etc)

// Socket
var socket = io();

socket.on('data', function(dat) {
    dataReceived(dat);
});

var settings;
socket.on('settings', function(set) {
    settings = set;
})

var data = {};

function dataReceived(dat) {
    console.log('received data');
    if (data[dat.stim]==undefined) {
        data[dat.stim] = {};
    }
    if (data[dat.stim][dat.area]==undefined) {
        data[dat.stim][dat.area] = [];
    }
    if (data[dat.stim][dat.area][dat.x]==undefined) {
        data[dat.stim][dat.area][dat.x] = [];
    }
    data[dat.stim][dat.area][dat.x][dat.y] = dat.data;
}

function requestElectrodeDataAll() {
    if (velec>0) {requestElectrodeData(e_gray);}
    if (velec>1) {requestElectrodeData(e_red);}
    if (velec>2) {requestElectrodeData(e_blue);}
}

function requestElectrodeData(electrode) {
    var req = {};
    if (cStim==-1) {return;}
    req.stim = stimTypes[cStim];
    if (cArea==undefined) {return;}
    req.area = cArea;
    var ePos = getElecPos(electrode);
    if (ePos==undefined) {return;}
    req.x = ePos.x;
    req.y = ePos.y;
    // check whether we have the data already
    var doRequest = (data[req.stim]==undefined) || (data[req.stim][req.area]==undefined) || (data[req.stim][req.area][req.x]==undefined) || (data[req.stim][req.area][req.x][req.y]==undefined);
    
    if (doRequest) {socket.emit('request',req);}
}

// GLOBAL VARIABLES
var nelec = 1;
var velec = nelec;
var step = 0;

// The application will create a renderer using WebGL, if possible,
// with a fallback to a canvas render. It will also setup the ticker
// and the root stage PIXI.Container
var rendererOptions = {
  antialiasing: false,
  transparent: true,
  resolution: window.devicePixelRatio,
  autoResize: true,
}

// trace starting points (they extend 190)
var trace_posx = [625,625,625];
var trace_posy = [200,350,500];
// position of the brain region circles
var xs = [270,250],
    ys = [110,30],
    r = [20,15];
// electrode and brain scale
var e_scale = 0.075;
var b_scale = 0.25;
// visual field
var vf_pos = [150,450,150]; // x (center) y (center), radius
var rf_pos = [310,300,300,300];

var ORIGIN_WIDTH = 1000, ORIGIN_HEIGHT = 600;
const app = new PIXI.Application(ORIGIN_WIDTH,ORIGIN_HEIGHT, rendererOptions);
var graphics = [];

// The application will create a canvas element for you that you
// can then insert into the DOM
document.getElementById("block2_canvas").appendChild(app.view);

var brain, e_gray = {}, e_red = {}, e_blue = {};
function add_sprites() {
    brain = PIXI.Sprite.fromImage('images/brain.png');
    brain.anchor.set(0,0);
    brain.scale.set(b_scale);
    brain.x = 0; brain.y = 0;
    app.stage.addChild(brain);

    e_gray.sprite = newElectrode('gray');
    e_gray.sprite.cursor = 'pointer';
    e_red.sprite = newElectrode('red');
    e_red.sprite.cursor = 'pointer';
    e_blue.sprite = newElectrode('blue');
    e_blue.sprite.cursor = 'pointer';
}

function newElectrode(str) {
    elec = PIXI.Sprite.fromImage('images/electrode_' + str + '.png');
    elec.anchor.set(0.5,0.5);
    elec.position.set(420,125);
    elec.scale.set(e_scale);
    elec.alpha = 0.8;
    elec.visible = false;
    elec.interactive = true;
    elec
        .on('pointerdown', buttonDown)
        .on('pointermove', buttonMove)
        .on('pointerup', buttonUp)
        .on('pointerupoutside', buttonUp);
    app.stage.addChild(elec);
    return elec;
}

var vf_g = rf_g = {};
var rf_lines = [];

function add_graphics() {
    // create circles for retina/lgn/evc
    var cs = [mtCallback,lipCallback];
    for (var xi=0;xi<xs.length;xi++) {
        var g = newInteractiveRegion(xs[xi],ys[xi],r[xi],0xFF0000,cs[xi],true);
        g.cursor = 'pointer';
    }
    // create ellipse for visual field
    var g = newInteractiveRegion(vf_pos[0],vf_pos[1],vf_pos[2],0xFFFFFF,vfDown,false);
    g.on('pointermove', vfMove)
        .on('pointerup', vfUp);
    g.cursor = 'crosshair'; // todo: swap to none when rendering stimulus
    vf_g.graphics = g;
    // create rectangle for recording area 
    var g = new PIXI.Graphics();
    g.lineStyle(2,0xFF0000,1);
    g.drawRect(rf_pos[0],rf_pos[1],rf_pos[2],rf_pos[3]);
    // no hitarea or callbacks
    app.stage.addChild(g);
    rf_g.graphics = g;
    // add lines from each visual area to the RF circle
    for (var ii=0;ii<xs.length;ii++) {
        var g = new PIXI.Graphics();0x5DADE2;0xCD6155
        g.lineStyle(2,0xFF0000,1);
        g.moveTo(xs[ii]+r[ii],ys[ii]);
        g.lineTo(460,270)
        g.visible = false;
        rf_lines.push(g);
        app.stage.addChild(g);
    }
    // create ellipse for record button
    createRecordButton();
}

function createRecordButton() {
    if (recordGraphic!=undefined) {recordGraphic.destroy();}
    var g = newInteractiveRegion(800,100,50,0xFF0000,recordButton,false);
    var style = new PIXI.TextStyle({fill:recording ? '#00ff00' : '#ffffff'});
    var t = new PIXI.Text('REC',style);
    t.x = 800; t.y = 100;
    t.anchor.set(0.5,0.5);
    app.stage.addChild(g);
    g.addChild(t);
    recordGraphic = g;
    recordGraphic.text = t;
    recordGraphic.cursor = 'pointer';
}

var trace_container;

function add_traces() {
    trace_container = new PIXI.Container();

    app.stage.addChild(trace_container);
}

var vf_text, area_text;

var area_text_list = {};

function add_text() {
    var style = new PIXI.TextStyle({
        fill: '#ffffff',
    });
    vf_text = new PIXI.Text('Visual field', style);
    vf_text.x = 150;
    vf_text.y = 300;
    vf_text.anchor.set(0.5,1);
    app.stage.addChild(vf_text);
    area_text = new PIXI.Text('Click a brain region to record', style);
    area_text.x = 460;
    area_text.y = 300;
    area_text.anchor.set(0.5,1);
    app.stage.addChild(area_text);
    // add up/down designations for visual field
    var style = new PIXI.TextStyle({
        fill: '#ffffff',
        fontSize: '10pt',
    });
    var text = new PIXI.Text('Left', style);
    text.x = 20;
    text.y = 450;
    text.anchor.set(0.5,1);
    app.stage.addChild(text);
    var text = new PIXI.Text('Right', style);
    text.x = 290;
    text.y = 450;
    text.anchor.set(1,1);
    app.stage.addChild(text);
    var text = new PIXI.Text('Up', style);
    text.x = 150;
    text.y = 320;
    text.anchor.set(0.5,1);
    app.stage.addChild(text);
    var text = new PIXI.Text('Down', style);
    text.x = 150;
    text.y = 590;
    text.anchor.set(0.5,1);
    app.stage.addChild(text);

    // add up/down designations for each area
    var style = new PIXI.TextStyle({
        fill: '#ffffff',
        fontSize: '10pt',
    });
    var text = new PIXI.Text('', style);
    text.x = 460;
    text.y = 320;
    text.anchor.set(0.5,1);
    app.stage.addChild(text);
    area_text_list.up = text;
    var text = new PIXI.Text('', style);
    text.x = 460;
    text.y = 590;
    text.anchor.set(0.5,1);
    app.stage.addChild(text);
    area_text_list.down = text;
    var text = new PIXI.Text('', style);
    text.x = 320;
    text.y = 450;
    text.anchor.set(0,1);
    app.stage.addChild(text);
    area_text_list.left = text;
    var text = new PIXI.Text('', style);
    text.x = 600;
    text.y = 450;
    text.anchor.set(1,1);
    app.stage.addChild(text);
    area_text_list.right = text;
}

function newInteractiveRegion(x,y,r,c,callback,square) {
    var g = new PIXI.Graphics();
    g.interactive = true;
    g.lineStyle(2,c,1);
    if (square) {
        g.drawRect(x-r,y-r,r*2,r*2);
    } else {
        g.drawCircle(x,y,r);
    }
    g.hitArea = g.getBounds();
    g.on('pointerdown', callback);
    // add to trackers
    app.stage.addChild(g);
    graphics.push(g);
    return g;
}

//////////////////////////////////////////////////////////////////////
///////////// CALLBACKS //////////////////////////////
//////////////////////////////////////////////////////////////////////

var markerPos = [],
    markerNeg = [];
function vfMove(event) {
    var pos = event.data.getLocalPosition(this.parent);
    // move the stimulus
    // remove vf position
    pos.x -= vf_pos[0]-vf_pos[2];
    pos.y -= vf_pos[1]-vf_pos[2];
    stimPos = pos;
}

var markerLists = [markerPos,markerNeg];
var markerColors = [0x00FF00,0xFF0000];
var markerVert = [true,false];

function vfDown(event) {
    this.down = true;
    if (event.data.originalEvent.ctrlKey) {
        resetMarkers(); return;
    }
    var shift = Number(event.data.originalEvent.shiftKey);    
    var pos = event.data.getLocalPosition(this.parent);
    // add marker (before removing vf position);
    addMarker(markerLists[shift],pos.x,pos.y,markerColors[shift],markerVert[shift])
}

function vfUp() {
    this.down = false;
}

function addMarker(list,x,y,c,v) {
    var g = new PIXI.Graphics();
    g.lineStyle(1,c,1);
    g.moveTo(x-5,y);
    g.lineTo(x+5,y);
    if (v) {
        g.moveTo(x,y-5);
        g.lineTo(x,y+5);
    }
    list.push(g);
    markerContainer.addChild(g);
}


// stimulus functions
var stimTypes = ['left','right','up','down'];
var stimFuncs = [function() {stimDots(180);},
                 function() {stimDots(0);},
                 function() {stimDots(270);},
                 function() {stimDots(90);}];
var cStim = -1;
var stimChanged = false;

function setStimulus(button) {
    var pStim = cStim;
    for (var i=0;i<stimTypes.length;i++) {
        cStim = button.id==stimTypes[i] ? i : cStim;
        document.getElementById(stimTypes[i]).style.border = button.id==stimTypes[i] ? 'solid #ffffff' : 'solid #32333b';
    }
    if (cStim!=pStim) {stimChanged = true;}
    requestElectrodeDataAll();
}

// switch functions

var cArea;

function mtCallback() {
    area_text.setText('Recording: MT');
    cArea = 'mt';
    updateLineVisibility(0);
    // resetMarkers();
    requestElectrodeDataAll();
    area_text_list.up.setText('Dorsal');
    area_text_list.down.setText('Ventral');
    area_text_list.left.setText('Anterior');
    area_text_list.right.setText('Posterior');
    recordGraphic.visible = true;
    lip = false;
    recordingMode='continuous';
    recording = pLipRecording;
    toggleRecording(recording);
    createRecordButton();
}

var lip = false;
function lipCallback() {
    area_text.setText('Recording: LIP');
    cArea = 'mt';
    updateLineVisibility(1);
    // resetMarkers();
    requestElectrodeDataAll();
    area_text_list.up.setText('Dorsal');
    area_text_list.down.setText('Ventral');
    area_text_list.left.setText('');
    area_text_list.right.setText('');
    pLipRecording = recording;
    recording = true;
    lip = true;
    recordGraphic.visible = false;
    recordingMode='integrate';
    toggleRecording(recording);
    resetRecordingAll();
}

function updateLineVisibility(c) {
    for (var i=0;i<rf_lines.length;i++) {
        rf_lines[i].visible = i == c;
    }
}

//////////////////////////////////////////////////////////////////////
///////////// reset //////////////////////////////
//////////////////////////////////////////////////////////////////////

var markerContainer;

function resetMarkers() {
    if (markerContainer!=undefined) {markerContainer.destroy();}
    markerContainer = new PIXI.Container();
    app.stage.addChild(markerContainer);

    markerPos = []; markerNeg = [];
}

// Noisy

var noisy = false;

function toggleNoisy() {
    noisy = !noisy;
    console.log('NOISY NOT IMPLEMENTED... DERP DERP');
    var noisyOpts = ['Off','On'];
    document.getElementById("noisy").innerHTML = "Noisy: " + noisyOpts[Number(noisy)];
}

//////////////////////////////////////////////////////////////////////
///////////// RECORD MODE //////////////////////////////
//////////////////////////////////////////////////////////////////////

// Record mode
var recording = false,
    recordingData = false,
    pLipRecording,
    delayRecTick,
    recTick,
    recordingMode = 'integrate'; // 'integrate' or 'continuous' -- for LIP or MT 

var recordGraphic,
    recsurr_container,
    rec_container;

function rec_init() {
    rec_container = new PIXI.Container();
    app.stage.addChild(rec_container);
    // init trace info
    _rec_init(e_gray);
    _rec_init(e_red);
    _rec_init(e_blue);
    // draw surroundings
    renderRecordingSurr();
    recsurr_container.visible = false;
}

function toggleRecording(set) {
    // switch recording AND switch the surrounding on and off
    if (set) {
        recording = true;
        recordingData = true;
        setRecContainer(true);
        trace_container.visible = false;
    } else {
        recording = false;
        recordingData = true;
        setRecContainer(false);
        trace_container.visible = true;
    }
}

function setRecContainer(set) {
    rec_container.visible = set;
    recsurr_container.visible = set;
    e_gray.rec.surr.visible = e_gray.sprite.visible;
    e_red.rec.surr.visible = e_red.sprite.visible;
    e_blue.rec.surr.visible = e_blue.sprite.visible;
}

function _rec_init(electrode) {
    electrode.rec = {};
    electrode.rec.trace = {};
    electrode.rec.trace.startX = electrode.trace.startX;
    electrode.rec.trace.startY = electrode.trace.startY;
    electrode.rec.trace.color = electrode.trace.color;
}

function recordButton() {
    if (delayRecTick!=undefined){
        clearTimeout(delayRecTick);
        delayRecTick=undefined;
        createRecordButton();
        return;
    }
    recording = !recording;
    toggleRecording(recording); 
    if (recording) {
        initDelayRecordStart();
    } else {
        createRecordButton();

    }
}

function initDelayRecordStart() {
    textDelay(2);
    trace_container.visible = false;
    delayRecTick = setTimeout(delayRecordStart,2000);
}

function textDelay(count) {
    if (count==0) {return;}
    recordGraphic.text.setText(count+'...');
    setTimeout(function() {textDelay(count-1);},1000);
}

function delayRecordStart() {
    delayRecTick = undefined;
    resetRecordingAll();
    toggleRecording(true);
    createRecordButton();
}

var recAll = {};

function resetRecordingAll() {
    resetRecording(e_gray); resetRecording(e_red); resetRecording(e_blue);
    recAll.tStart = now();
    recAll.tPrev = now();
    // rec_container.clear();
    recTick = setTimeout(updateRecordings,rec_pix_t);
}

function resetRecording(electrode) {
    electrode.rec.t = [0]; // time (used for drawing)
    electrode.rec.y = [0]; // y value
    electrode.rec.randn = 0; // current noise value
}

// Recording parameters
var rec_pix_t = 25, // 1 pixel = X ms
    rec_max = 5000; // so the total dist = rec_max/rec_pix_t
var recReset = undefined;

function updateRecordings() {
    if (recording) {
        recTick = setTimeout(updateRecordings,rec_pix_t);
    } else {
        clearTimeout(recTick);
        return;
    }
    // if we are past the 10 second delay, prepare to reset
    if ((now()-recAll.tStart)>rec_max) {
        // resetRecordingAll();
        if (lip) {
            resetRecordingAll();
        } else {
            recordingData = false;
        }
        // recTick = setTimeout(endRecordings,10000);
        return;
    }

    if (recordingData) {
        // otherwise, update all recordings
        if (e_gray.sprite.visible) {_updateRecordings(e_gray);}
        if (e_red.sprite.visible) {_updateRecordings(e_red);}
        if (e_blue.sprite.visible) {_updateRecordings(e_blue);}
    }
}

// function endRecordings() {
//     toggleRecording(false);
//     createRecordButton();
// }

var drift_noise = 0.1,
    lip_mult = 0.01,
    mt_noise_mult = 5;

function _updateRecordings(electrode) {
    // init
    if (electrode.rec==undefined) {
        resetRecording(electrode);
    }
    var fr;
    if (lip) {
        fr = lip_mult * (electrode.firingRate + electrode.rec.randn);
    } else {
        fr = electrode.firingRate + electrode.rec.randn;
    }
    // console.log(fr);
    electrode.rec.randn = (1-drift_noise)*electrode.rec.randn + drift_noise*(mt_noise_mult*Math.sqrt(mt_noise_mult*electrode.firingRate)*randn());
    electrode.rec.t.push(electrode.rec.t[electrode.rec.t.length-1]+1);

    if (recordingMode=='integrate') {
        electrode.rec.y.push(electrode.rec.y[electrode.rec.y.length-1]+fr);
    } else if (recordingMode=='continuous'){
        electrode.rec.y.push(fr);
    }

    _rRecTrace(electrode);
}

function renderRecordingSurr() {
    // Render the surrounding area
    recsurr_container = new PIXI.Container();
    app.stage.addChild(recsurr_container);
    e_gray.rec.surr = _rRecSurr(e_gray,recsurr_container);
    e_red.rec.surr = _rRecSurr(e_red,recsurr_container);
    e_blue.rec.surr = _rRecSurr(e_blue,recsurr_container);
}

var rec_x_off = 70;
function _rRecSurr(electrode,container) {
    var tickStyle = new PIXI.TextStyle({
        fill: '#ffffff',
        fontSize: '10pt',
    });

    var t_per_pix = rec_max/rec_pix_t;
    var local_container = new PIXI.Container();
    var xdist = t_per_pix, ydist = 40;
    // Get the bottom left corner of the graph
    var x = electrode.rec.trace.startX+rec_x_off,
        y = electrode.rec.trace.startY;
    var xoff = x-10, yoff = y+10; // offsets
    // 
    var g = new PIXI.Graphics();
    g.lineStyle(1,0xFFFFFF,1);
    // draw X axis
    g.moveTo(x,yoff);
    g.lineTo(x+xdist,yoff);
    // draw X ticks
    for (var ti=0;ti<=xdist;ti+=50) {
        g.moveTo(x+ti,yoff);
        g.lineTo(x+ti,yoff+5);
        var t = new PIXI.Text(ti*t_per_pix/10000,tickStyle);
        t.x = x+ti;
        t.y = yoff+12;
        t.anchor.set(0.5,0.5);
        local_container.addChild(t);
    }
    // Draw x label
    var t = new PIXI.Text('Time (s)',tickStyle);
    t.x = x+125;
    t.y = yoff + 30;
    t.anchor.set(0.5,0.5);
    local_container.addChild(t);
    // draw Y axis
    g.moveTo(x,y);
    g.lineTo(x,y-50);
    // draw Y ticks
    for (var yi=0;yi<=50;yi+=25) {
        g.moveTo(x,y-yi);
        g.lineTo(x-5,y-yi);
        var t = new PIXI.Text(yi,tickStyle);
        t.x = x-5;
        t.y = y-yi;
        t.anchor.set(1,0.5);
        local_container.addChild(t);
    }
    // Draw y label
    var t = new PIXI.Text('Spikes (per sec)',tickStyle);
    t.x = x-35;
    t.y = y-25;
    t.anchor.set(0.5,0.5);
    t.rotation = Math.PI*3/2;
    local_container.addChild(t);
    // Finalize
    local_container.addChild(g);
    container.addChild(local_container);
    return local_container;

}

function _rRecTrace(electrode) {
    if ((electrode.rec.trace!=undefined)&&(electrode.rec.trace.g!=undefined)) {
        electrode.rec.trace.g.destroy();
    }
    g = new PIXI.Graphics();
    g.lineStyle(1,electrode.rec.trace.color,1);
    g.moveTo(electrode.rec.trace.startX+rec_x_off,electrode.rec.trace.startY-electrode.rec.y[0]);
    for (var i=1;i<electrode.rec.t.length;i++) {
        g.lineTo(electrode.rec.trace.startX+i+rec_x_off,electrode.rec.trace.startY-electrode.rec.y[i]);
    }
    rec_container.addChild(g);
    electrode.rec.trace.g = g;
}

function updateRecordingsAll() {
    if (velec>0) {updateRecordings(e_gray);}
    if (velec>1) {updateRecordings(e_red);}
    if (velec>2) {updateRecordings(e_blue);}
}

//////////////////////////////////////////////////////////////////////
///////////// render loop //////////////////////////////
//////////////////////////////////////////////////////////////////////

var stimPos;

function updateFiringRates(electrode) {
    if (frChecksFail()) {return;}

    // Use the stimulus position (passed) and the electrode position (saved: elecPos);
    var ePos = getElecPos(electrode);
    var sPos = getStimPos();
    if ((ePos==undefined)||(sPos==undefined)) {
        if (electrode.sprite.visible) {
            spk_setRate(electrode.trace,0);
        }
    } else {
        var idx = sPos.x*51+sPos.y+1; 
        electrode.firingRate = coherence/100*data[stimTypes[cStim]][cArea][ePos.x][ePos.y][idx];
        if (electrode.sprite.visible) {
            spk_setRate(electrode.trace,electrode.firingRate);
        }
    }
}

function frChecksFail() {
    return ((data==undefined) || 
        (data[stimTypes[cStim]]==undefined) ||
        (data[stimTypes[cStim]][cArea]==undefined)
        );
}

function getElecPos(electrode) {
    var elecPos = electrode.sprite.elecPos;

    if (elecPos==undefined) {return(undefined);}

    var req = {};
    req.x = Math.floor(elecPos.x/rf_pos[2]*51);
    req.y = Math.floor(elecPos.y/rf_pos[3]*51);

    if ((req.x<0)||(req.y<0)) {return(undefined);}
    if ((req.x>50)||(req.y>50)) {return(undefined);}
    return(req);
}

function getStimPos() {
    if (stimPos==undefined) {return(undefined);}

    var req = {};
    req.x = Math.floor(stimPos.x/(vf_pos[2]*2)*51);
    req.y = Math.floor(stimPos.y/(vf_pos[2]*2)*51);
    var dist = Math.hypot(req.x-25,req.y-25)
    if ((dist>25)) {return(undefined);}
    return(req);
}

var debug_g;

function debug() {
    if (debug_g!=undefined) {debug_g.destroy();}
    debug_g = new PIXI.Graphics();
    var pix_per_sq = 6 // Math.floor(vf_pos[2]*2/51);
    var dat = data[stimTypes[cStim]][cArea][getElecPos(e_gray).x][getElecPos(e_gray).y];
    for (var x=0;x<51;x++) {
        for (var y=0;y<51;y++) {
            var idx = x*51+y+1;
            var cval = Math.round(dat[idx]/40*255);
            var col = Math.pow(cval,3); //rgb2hex(cval,cval,cval);
            debug_g.beginFill(col,0.5);
            debug_g.drawRect(x*pix_per_sq,300+y*pix_per_sq,pix_per_sq,pix_per_sq);
        }
    }
    app.stage.addChild(debug_g);
}

function dedebug() {
    debug_g.destroy();
    debug_g = undefined;
}

var stimContainer;
var pix_per_sq = 6;
var dotGraphic,
    dotContainer,
    dots;

function updateFiringRatesAll() {
    if (velec>0) {updateFiringRates(e_gray);}
    if (velec>1) {updateFiringRates(e_red);}
    if (velec>2) {updateFiringRates(e_blue);}
    if (noisy) {
        // this is hard because we don't actually know which electrode prefers which direction, so we can't really have a
        // "noisy" stimulus
        // instead we'll mimic:
        // take the first two electrodes, 60% of the time make the lower firing one randomly go to zero
        var lower,higher;
        if (e_gray.firingRate<e_red.firingRate) {
            lower = e_gray;
            higher = e_red;
        } else {
            lower = e_red;
            higher = e_gray;
        }
        if (Math.random()<0.6) {
            // reduce the lower electrode
            lower.firingRate = 0.5*Math.random()*lower.firingRate;
        } else {
            // raise the lower firing and lower the higher
            higher.firingRate = 0.5*Math.random()*higher.firingRate;
            lower.firingRate = 4*Math.random()*lower.firingRate;
        }
    }
}

function renderStimulus() {
    if (cStim>=0) {
        updateFiringRatesAll();

        // request new graphics object 
        if (stimChanged && (stimContainer != undefined)) {
            stim_cleanup();
        }
        if (stimContainer==undefined) {
            stimContainer = new PIXI.Container();
            app.stage.addChild(stimContainer);
        }

        // update position
        stimFuncs[cStim]();

        // ensure we don't do multiple udpates
        stimChanged = false;
    }
}

function stim_cleanup() {
    if (stimContainer!=undefined) {
        stimContainer.destroy();
        stimContainer = undefined;
        dotContainer = undefined;
        dotGraphic = undefined;
    }
}

function stimDots(theta) {
    if (stimChanged || (dotGraphic==undefined)) {
        dots = initDots(30,60,60,1,theta*Math.PI/180,0.1,2);
        dots.t = now();
        dotContainer = new PIXI.Container();
        stimContainer.addChild(dotContainer);
        dotGraphic = new PIXI.Graphics();
        dotContainer.addChild(dotGraphic);
        var mask = new PIXI.Graphics();
        mask.beginFill(0xFFFFFF,1);
        mask.drawCircle(30,30,30);
        dotContainer.addChild(mask);
        dotContainer.mask = mask;
    }
    dots = updateDots(dots,coherence/100,dots.dir,now()-dots.t);
    drawDots(dots,dotGraphic);
    dots.t = now();
    dotContainer.position.set(stimPos.x+(vf_pos[0]-vf_pos[2])-30,stimPos.y+(vf_pos[1]-vf_pos[2])-30);
}

function renderTraces() {
    if (velec>0) {
        _rTrace(e_gray);
    } else if (e_gray.trace.g!=undefined) {
        e_gray.trace.g.destroy();
        e_gray.trace.g = undefined;
    }
    if (velec>1) {_rTrace(e_red);} else if (e_red.trace.g!=undefined) {
        e_red.trace.g.destroy();
        e_red.trace.g = undefined;
    }
    if (velec>2) {_rTrace(e_blue);} else if (e_blue.trace.g!=undefined) {
        e_blue.trace.g.destroy();
        e_blue.trace.g = undefined;
    }
}

function _rTrace(ctrace) {
    if ((ctrace.trace!=undefined)&&(ctrace.trace.g!=undefined)) {
        ctrace.trace.g.destroy();
    }
    ctrace.trace.g = new PIXI.Graphics();
    ctrace.trace.g.lineStyle(1,ctrace.trace.color,1);
    if (ctrace.trace.silent) {
        ctrace.trace.g.moveTo(ctrace.trace.startX,ctrace.trace.startY);
        ctrace.trace.g.lineTo(ctrace.trace.startX+ctrace.trace.spk.length,ctrace.trace.startY);
    } else {
        ctrace.trace.g.moveTo(ctrace.trace.startX,ctrace.trace.startY-ctrace.trace.spk[0]);
        for (var i=1;i<ctrace.trace.spk.length;i++) {
            ctrace.trace.g.lineTo(ctrace.trace.startX+i,ctrace.trace.startY-ctrace.trace.spk[i]);
        }
        trace_container.addChild(ctrace.trace.g);
    }
}

var tick;

function render() {
    renderTraces();

    var sPos = getStimPos();
    if (sPos!=undefined) {renderStimulus();} else {
        stim_cleanup();
    }

    tick = requestAnimationFrame(render);

    app.renderer.render(app.stage);
}

function local_resize() {
  var ratio = window.innerHeight/ORIGIN_HEIGHT*0.75;

  // var ratio = Math.min(window.innerWidth/ORIGIN_WIDTH,
                   // window.innerHeight/ORIGIN_HEIGHT);
  app.stage.scale.set(ratio);
  app.renderer.resize(Math.ceil(ORIGIN_WIDTH * ratio),
                  Math.ceil(ORIGIN_HEIGHT * ratio));
}

//////////////////////////////////////////////////////////////////////
///////////// interactive functionality //////////////////////////////
//////////////////////////////////////0////////////////////////////////

function buttonDown(event) {
    this.isdown = true;
    // calculate offset
    var pos = event.data.getLocalPosition(this.parent);
    this.offX = pos.x - this.x;
    this.offY = pos.y - this.y;
    this.alpha = 1;
}

function buttonUp() {
    this.isdown = false;
    this.alpha = 0.8;
    requestElectrodeDataAll();
}

function buttonMove(event) {
    if (this.isdown) {
        var pos = event.data.getLocalPosition(this.parent);
        this.elecPos = Object.assign({},pos);
        this.elecPos.x = this.elecPos.x-this.offX-e_gray.sprite.width/2+6-rf_pos[0];
        this.elecPos.y = this.elecPos.y-this.offY+e_gray.sprite.height/2-rf_pos[1];
        this.position.set(pos.x-this.offX,pos.y-this.offY);
    }
}

var coherence = 100;
function updateCoherence() {
    coherence = parseInt(document.getElementById('coherence').value); 
    document.getElementById("co_label").value = coherence;
}

function updateElectrodes() {
    velec = nelec;
    e_gray.sprite.visible = velec > 0;
    e_red.sprite.visible = velec > 1;
    e_blue.sprite.visible = velec > 2;
    if (e_gray.trace!=undefined) {
        e_gray.trace.silent = (curBlock==1) || !(velec > 0);
        e_red.trace.silent = (curBlock==1) || !(velec > 1);
        e_blue.trace.silent = (curBlock==1) || !(velec > 2);
    } 
}

function run(i) {   
    $("#continue").show();
    switch(i) {
        case 2:
            // pass
            updateElectrodes(0);
            resetMarkers();
            render();
            break;
    }
}

function launch_local() {
    // global inits
    spk_init();

    // set renderer stuff
    app.renderer.plugins.interaction.cursorStyles.crosshair = 'crosshair';
    app.renderer.plugins.interaction.cursorStyles.none = 'none';
    app.renderer.plugins.interaction.cursorStyles.grab = 'grab';
    app.renderer.plugins.interaction.cursorStyles.grabbing= 'grabbing';

    // local graphic inits
    local_resize();
    add_sprites();
    add_graphics(); 
    add_text();
    setStimulus({});

    // get and save session informaiton
    if (localStorage.evc_step != undefined) {
        step = localStorage.evc_step;
    }

    // generate the three spike traces
    e_gray.trace = spk_addTrace();
    e_gray.trace.startX = trace_posx[0];
    e_gray.trace.startY = trace_posy[0];
    e_gray.trace.color = 0xBEBEBE;
    e_red.trace = spk_addTrace();
    e_red.trace.startX = trace_posx[1];
    e_red.trace.startY = trace_posy[1];
    e_red.trace.color = 0xCD6155;
    e_blue.trace = spk_addTrace();
    e_blue.trace.startX = trace_posx[2];
    e_blue.trace.startY = trace_posy[2];
    e_blue.trace.color = 0x5DADE2;

    // add location information
    e_gray.trace.x = trace_posx[0];
    e_red.trace.x = trace_posx[1];
    e_blue.trace.x = trace_posx[2];
    e_gray.trace.y = trace_posy[0];
    e_red.trace.y = trace_posy[1];
    e_blue.trace.y = trace_posy[2];

    add_traces();
    updateElectrodes(0);

    rec_init();

    // set the current step correctly (which stimulus and areas are accessible)
    socket.emit('settings');

    // after the tutorials, this will default to the final step
    setStep(false);
}

function setStep(override) {
    if (override) {
        step = Infinity;
    }

    if (step>=0) {

    } 
}