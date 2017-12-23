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

// The application will create a canvas element for you that you
// can then insert into the DOM
document.getElementById("block2").appendChild(app.view);

var brain, e_gray;
function add_sprites() {
    brain = PIXI.Sprite.fromImage('images/brain.png');
    brain.anchor.set(0);
    brain.scale.set(0.25);
    brain.x = 0; brain.y = 0;
    app.stage.addChild(brain);

    e_gray = PIXI.Sprite.fromImage('images/electrode_gray.png');
    // e_red.anchor.set(100,100);
    e_gray.anchor.set(0,9);
    e_gray.position.set(300,0);
    e_gray.scale.set(0.1);
    e_gray.interactive = true;
    e_gray
        .on('pointerdown', buttonDown)
        .on('pointermove', buttonMove)
        .on('pointerup', buttonUp)
        .on('pointerupoutside', buttonUp);
    app.stage.addChild(e_gray);
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

function buttonDown() {
    this.isdown = true;
}

function buttonUp() {
    this.isdown = false;
}

function buttonMove(event) {
    if (this.isdown) {
        var pos = event.data.getLocalPosition(this.parent);
        this.position.set(pos.x,pos.y); 
    }
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
}