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

var ORIGIN_WIDTH = 800, ORIGIN_HEIGHT = 600;
const app = new PIXI.Application(ORIGIN_WIDTH,ORIGIN_HEIGHT, rendererOptions);
var graphics = [];

// The application will create a canvas element for you that you
// can then insert into the DOM
document.getElementById("block2_canvas").appendChild(app.view);

var brain, e_gray = {}, e_red = {}, e_blue = {};
function add_sprites() {
    brain = PIXI.Sprite.fromImage('images/brain.png');
    brain.anchor.set(0,0);
    brain.scale.set(0.25);
    brain.x = 0; brain.y = 0;
    app.stage.addChild(brain);

    e_gray.sprite = newElectrode('gray'),
        e_red.sprite = newElectrode('red'),
        e_blue.sprite = newElectrode('blue');
}

function newElectrode(str) {
    elec = PIXI.Sprite.fromImage('images/electrode_' + str + '.png');
    elec.anchor.set(0.5,0.5);
    elec.position.set(500,200);
    elec.scale.set(0.075);
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
    var xs = [93,170,300],
        ys = [203,175,145],
        r = [20,15,30];
        cs = [retinaCallback,lgnCallback,v1Callback];
    for (var xi=0;xi<xs.length;xi++) {
        newInteractiveRegion(xs[xi],ys[xi],r[xi],0xFF0000,cs[xi]);
    }
    // create ellipse for visual field
    g = newInteractiveRegion(150,450,150,0xFFFFFF,vfDown);
    g.on('pointermove', vfMove)
        .on('pointerup', vfUp);
    vf_g.graphics = g;
    // create circle for 
    var g = new PIXI.Graphics();
    g.lineStyle(2,0xFFFFFF,1);
    g.drawCircle(460,450,150);
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
    area_text = new PIXI.Text('Click a region to record', style);
    area_text.x = 460;
    area_text.y = 300;
    area_text.anchor.set(0.5,1);
    app.stage.addChild(area_text);
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

function vfMove() {
    // 
}

function vfDown() {
    this.down = true;
}

function vfUp() {
    this.down = false;
}


// stimulus functions
var stimTypes = ['wedge','ring','bar'];
var cStim = -1;

function setStimulus(button) {
    for (var i=0;i<stimTypes.length;i++) {
        button.id==stimTypes[i] ? cStim=i : cStim=cStim;
        document.getElementById(stimTypes[i]).style.border = button.id==stimTypes[i] ? 'solid #ffffff' : 'solid #32333b';
    }
}

// switch functions

function retinaCallback() {
    area_text.setText('Recording from: Retina');
    updateLineVisibility(0);
    rf_lines[0].visible = true;
    resetRecord();
}

function lgnCallback() {
    area_text.setText('Recording from: LGN');
    updateLineVisibility(1);
    resetRecord();
}

function v1Callback() {
    area_text.setText('Recording from: EVC');
    updateLineVisibility(2);
    resetRecord();
}

function updateLineVisibility(c) {
    for (var i=0;i<rf_lines.length;i++) {
        rf_lines[i].visible = i == c;
    }
}

//////////////////////////////////////////////////////////////////////
///////////// reset //////////////////////////////
//////////////////////////////////////////////////////////////////////

var pMarks = [], nMarks = [];

function resetRecord() {
    pMarks = []; nMarks = [];
}

//////////////////////////////////////////////////////////////////////
///////////// render loop //////////////////////////////
//////////////////////////////////////////////////////////////////////

var tick;

function render() {
    //pass 
    // tick = requestAnimationFrame(render);
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
//////////////////////////////////////////////////////////////////////

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
}

function buttonMove(event) {
    if (this.isdown) {
        var pos = event.data.getLocalPosition(this.parent);
        this.position.set(pos.x-this.offX,pos.y-this.offY); 
    }
}

function updateElectrodes() {
    velec = nelec;
    e_gray.sprite.visible = velec > 0;
    e_red.sprite.visible = velec > 1;
    e_blue.sprite.visible = velec > 2;
}

function run(i) {   
    $("#continue").show();
    switch(i) {
        case 2:
            // pass
            render();
            break;
    }
}

function launch_local() {
    // global inits
    spk_init();

    // local graphic inits
    local_resize();
    add_sprites();
    add_graphics(); 
    add_text();
    updateElectrodes(0);
    setStimulus({});  

    // get and save session informaiton
    if (localStorage.evc_step != undefined) {
        step = localStorage.evc_step;
    }

    // generate the three spike traces
    e_gray.trace = spk_addTrace();
    e_red.trace = spk_addTrace();
    e_blue.trace = spk_addTrace();

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