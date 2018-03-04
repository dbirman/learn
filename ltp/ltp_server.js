var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get( '/*' , function( req, res ) {
    // this is the current file they have requested
    var file = req.params[0]; 
    // console.log('\t :: Express :: file requested: ' + file);    

    // give them what they want
    res.sendfile("./" + file);
}); 

/*

  HEBBIAN LEARNING SIMULATION SERVER

  * Login
  Students or TAs get placed into their section's tracking lists, students replace an AI player

*/

var sections = {};

function initSection(num) {
  var newSection = {};
  newSection.TAs = [];
  newSection.students = [];
  newSection.simulation = initSimulation();
  newSection.tick = undefined; // tracks the 1 second tick when the simulation is on

  sections[num] = newSection;
}

io.on('connection', function(socket){
  console.log('Connected: ' + socket.id);

  socket.on('login', function(data){
    console.log('login attempt received');
    console.log(data);
    socket.sectionNum = data.sectionNum;
    if (data.student) {
      addStudent(data.sectionNum,socket.id);
      io.to(socket.id).emit('login',true);

      socket.on('synapse', function(syn) {updateSynapse(syn,socket.sectionNum);});
    } else {
      if (data.password==' ') {
        addTA(data.sectionNum,socket.id);
        io.to(socket.id).emit('login',true);

        socket.on('play', function() {toggleSimulation(socket.sectionNum);});

        socket.on('matrixRequest', function() {io.to(socket.id).emit('matrix',sections[socket.sectionNum].simulation.v1_wm);});
      }
    }
  });

  socket.on('disconnect', function(){
    console.log('user disconnected');
    try {
      remove(sections[socket.sectionNum].students,socket.id);
      remove(sections[socket.sectionNum].TAs,socket.id);
    } catch (err) {
      console.log(err);
    }
  }); 
});

function addStudent(sectionNum,id) {
  checkInitSection(sectionNum);
  if (sections[sectionNum].students.length>18) {
    io.to(id).emit('login_fail');
    return;
  }
  sections[sectionNum].students.push(id);
}

function addTA(sectionNum,id) {
  checkInitSection(sectionNum);
  sections[sectionNum].TAs.push(id);
}

function checkInitSection(num) {
  if (sections[num]==undefined) {
    initSection(num);
  }
}


var port = 8080;
http.listen(port, function(){
  console.log('listening on *: ' + port);
});

function remove(array, element) {
    const index = array.indexOf(element);
    
    if (index !== -1) {
        array.splice(index, 1);
    }
}




//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////// SIMULATION CODE  ////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////

function getSim(num) {
  return sections[num].simulation;
}

function setSim(num,sim) {
  sections[num].simulation = sim;
}

function updateSynapse(syn,num) {

}

function initSimulation() {
    // Set number of v1 and lgn neurons
    var nV1 = 18;
    var nLGN = 18;

    // init 18x18 v1 weight matrix (fully connected)
    var v1_wm = new Array(18);
    for (var i = 0; i < nV1; i++) {
        v1_wm[i] = new Array(nV1);
        v1_wm[i] = Array.from({length: nV1}, () => (Math.random()*.5 - .25));
    }

    // init v1 firing rates to 0
    var v1_fr = Array.from({length: nV1}, () => 0);
    
    // init 18x18 v1<-->lgn weight matrix
    var initWeights = [-.9, -.8, -.75, -.7, .7, .75, .8, .9]
    var lgn_wm = new Array(nV1);
    for (var i = 0; i < nV1; i++) {
      lgn_wm[i] = new Array(nLGN);
      lgn_wm[i] = Array.from({length: nLGN}, () => (initWeights[Math.floor(Math.random()*initWeights.length)] + (-.025+Math.random()*.05)));
    }

    // init 18x18 v1<-->lgn mask that determines if 2 neurons are connected.
    var lgn_mask = new Array(nV1);
    for (var i = 0; i < nV1; i++) {
        lgn_mask[i] = new Array(nLGN);
        lgn_mask[i] = Array.from(Array(nLGN), () => 0); // 0 if not connected
        var inJ = Math.floor(i / 3);
        for (var j = i; j < i + 3; j++) {
            lgn_mask[i][j % lgn_mask[i].length] = 1; // 1 if they are
        }
    }
    
    var sim = {};
    // return a dictionary called sim
    sim.nV1 = nV1;
    sim.nLGN = nLGN;
    sim.v1_wm = v1_wm;
    sim.v1_fr = v1_fr;
    sim.lgn_wm = lgn_wm;
    sim.lgn_mask = lgn_mask;

    return sim
}

function resetSimulation(sim) {
  
}

function toggleSimulation(num) {
  if (runningSections.indexOf(sections[num])>-1) {
    remove(runningSections,sections[num]);
    return;
  }
  runningSections.push(sections[num]);
}

var tickID,
  runningSections = [];

function tick() {
  console.log('tick');
  tickID = setTimeout(tick,1000);

  for (var i=0;i<runningSections.length;i++) {
    _tick(runningSections[i].simulation);
  }


}

function _tick(sim) {
    // Show an orientation and use it to determine LGN, then V1 firing rates.
    var whichOr = tickId % sim.counter;
    var lgn_fr = Array.from(Array(sim.nLGN), () => 0);
    lgn_fr[whichOr] = 10;



    // Set each v1 neuron's firing rate according to the sum of its inputs * weights
    var v1_fr = new Array(sim.nV1);
    for (var i = 0; i < sim.nV1; i++) {
        var w_v1 = sim.v1_wm[i];
        var w_lgn = sim.lgn_wm[i];
        var mask_lgn = sim.lgn[mask[i]];

        var thisFR = 0;
        // first add previous v1 firing rates * weights
        for (var j = 0; j < sim.nV1; j++){
            thisFR += w_v1[j] * sim.v1_fr[j];
        }

        // then add mask firing rates
        for (var j = 0; j < sim.nLGN; j++){
            thisFR += w_lgn[j]*mask_lgn[j]*lgn_fr[j];
        }

        v1_fr[i] = thisFR;
    }

    sim.v1_fr = v1_fr;
}

tick();
