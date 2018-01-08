// Socket
var socket = io();

socket.on('data', function(dat) {
    dataReceived(dat);
});

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
var xs = [93,170,300],
    ys = [203,175,145],
    r = [20,15,30];
// electrode and brain scale
var e_scale = 0.075;
var b_scale = 0.25;
// visual field
var vf_pos = [150,450,150]; // x (center) y (center), radius
var rf_pos = [310,300,300,300];

var ORIGIN_WIDTH = 900, ORIGIN_HEIGHT = 600;
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
    e_blue.sprite = newElectrode('blue');
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
        cs = [retinaCallback,lgnCallback,v1Callback];
    for (var xi=0;xi<xs.length;xi++) {
        var g = newInteractiveRegion(xs[xi],ys[xi],r[xi],0xFF0000,cs[xi]);
        g.cursor = 'pointer';
    }
    // create ellipse for visual field
    var g = newInteractiveRegion(vf_pos[0],vf_pos[1],vf_pos[2],0xFFFFFF,vfDown);
    g.on('pointermove', vfMove)
        .on('pointerup', vfUp);
    g.cursor = 'crosshair'; // todo: swap to none when rendering stimulus
    vf_g.graphics = g;
    // create rectangle for recording area 
    var g = new PIXI.Graphics();
    g.lineStyle(2,0xFFFFFF,1);
    g.drawRect(rf_pos[0],rf_pos[1],rf_pos[2],rf_pos[3]);
    // no hitarea or callbacks
    app.stage.addChild(g);
    rf_g.graphics = g;
    // add lines from each visual area to the RF circle
    for (var ii=0;ii<xs.length;ii++) {
        var g = new PIXI.Graphics();
        g.lineStyle(2,0xFF0000,1);
        g.moveTo(xs[ii]+r[ii],ys[ii]);
        g.lineTo(460,270)
        g.visible = false;
        rf_lines.push(g);
        app.stage.addChild(g);
    }
}

var trace_container;

function add_traces() {
    trace_container = new PIXI.Container();

    app.stage.addChild(trace_container);
}

var vf_text, area_text;

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

    // add up/down designations for each area
    var style = new PIXI.TextStyle({
        fill: '#ffffff',
        fontSize: '10pt',
    });
    var text = new PIXI.Text('Dorsal (up)', style);
    text.x = 460;
    text.y = 320;
    text.anchor.set(0.5,1);
    app.stage.addChild(text);
    var text = new PIXI.Text('Ventral (down)', style);
    text.x = 460;
    text.y = 590;
    text.anchor.set(0.5,1);
    app.stage.addChild(text);
    var text = new PIXI.Text('Anterior (left)', style);
    text.x = 320;
    text.y = 450;
    text.anchor.set(0,1);
    app.stage.addChild(text);
    var text = new PIXI.Text('Posterior (right)', style);
    text.x = 600;
    text.y = 450;
    text.anchor.set(1,1);
    app.stage.addChild(text);
}

function newInteractiveRegion(x,y,r,c,callback) {
    var g = new PIXI.Graphics();
    g.interactive = true;
    g.lineStyle(2,c,1);
    g.drawCircle(x,y,r);
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
    stimMoved = stimPos!=undefined;
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
var stimTypes = ['dotpos','dotneg','wedge','ring','vertbar','horizbar'];
var cStim = -1;

function setStimulus(button) {
    for (var i=0;i<stimTypes.length;i++) {
        cStim = button.id==stimTypes[i] ? i : cStim;
        document.getElementById(stimTypes[i]).style.border = button.id==stimTypes[i] ? 'solid #ffffff' : 'solid #32333b';
        requestElectrodeDataAll();
    }
}

// switch functions

var cArea;

function retinaCallback() {
    area_text.setText('Recording from: Retina');
    cArea = 'retina';
    updateLineVisibility(0);
    rf_lines[0].visible = true;
    resetMarkers();
    requestElectrodeDataAll();
}

function lgnCallback() {
    area_text.setText('Recording from: LGN');
    cArea = 'lgn';
    updateLineVisibility(1);
    resetMarkers();
    requestElectrodeDataAll();
}

function v1Callback() {
    area_text.setText('Recording from: EVC');
    cArea = 'evc';
    updateLineVisibility(2);
    resetMarkers();
    requestElectrodeDataAll();
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
        if (electrode.sprite.visible) {
            spk_setRate(electrode.trace,data[stimTypes[cStim]][cArea][ePos.x][ePos.y][idx]);
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
            console.log(col,);
            debug_g.beginFill(col,0.5);
            debug_g.drawRect(x*pix_per_sq,300+y*pix_per_sq,pix_per_sq,pix_per_sq);
        }
    }
    app.stage.addChild(debug_g);
}

var stimMoved = false;

function renderStimulus() {
    if (stimMoved) {
        if (velec>0) {updateFiringRates(e_gray);}
        if (velec>1) {updateFiringRates(e_red);}
        if (velec>2) {updateFiringRates(e_blue);}
        stimMoved = false;
    }
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
    renderStimulus();

    tick = requestAnimationFrame(render);

    app.renderer.render(app.stage);
}

function local_resize() {
  var ratio = Math.min(window.innerWidth/ORIGIN_WIDTH,
                   window.innerHeight/ORIGIN_HEIGHT);
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
    add_traces();
    updateElectrodes(0);

    // set the current step correctly (which stimulus and areas are accessible)

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