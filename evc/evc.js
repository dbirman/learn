// GLOBAL VARIABLES
var nelec = 1;
var velec = nelec;

// The application will create a renderer using WebGL, if possible,
// with a fallback to a canvas render. It will also setup the ticker
// and the root stage PIXI.Container
var rendererOptions = {
  antialiasing: true,
  transparent: true,
  resolution: window.devicePixelRatio,
  autoResize: true,
}

const app = new PIXI.Application(800,600, rendererOptions);
var graphics = [];

// The application will create a canvas element for you that you
// can then insert into the DOM
document.getElementById("block2_canvas").appendChild(app.view);

var brain, e_gray, e_red, e_blue;
function add_sprites() {
    brain = PIXI.Sprite.fromImage('images/brain.png');
    brain.anchor.set(0,0);
    brain.scale.set(0.25);
    brain.x = 0; brain.y = 0;
    app.stage.addChild(brain);

    e_gray = newElectrode('gray'),
        e_red = newElectrode('red'),
        e_blue = newElectrode('blue');
    app.stage.addChild(e_gray);
    app.stage.addChild(e_red);
    app.stage.addChild(e_blue);
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
    return elec;
}

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
    // create circle for 
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
    area_text.x = 450;
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




// switch functions

function retinaCallback() {
    area_text.setText('Recording from: Retina');
    resetRecord();
}

function lgnCallback() {
    area_text.setText('Recording from: LGN');
    resetRecord();
}

function v1Callback() {
    area_text.setText('Recording from: EVC');
    resetRecord();
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
    e_gray.visible = velec > 0;
    e_red.visible = velec > 1;
    e_blue.visible = velec > 2;
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
    add_sprites();
    add_graphics(); 
    add_text();
    updateElectrodes(0);
}