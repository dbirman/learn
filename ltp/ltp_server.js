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
      if (data.password=='whydidakshaymakemedothis') {
        addTA(data.sectionNum,socket.id);
        io.to(socket.id).emit('login',true);
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

function initSimulation(sim) {

}

function resetSimulation(sim) {
  
}

function startSimulation(sim) {

  sim.tick = setTimeout(function() {tickSimulation(sim);},1000);
}

function stopStimulation(sim) {
  clearTimeout(sim.tick);
}

function tickSimulation(sim) {

}