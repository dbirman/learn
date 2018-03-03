
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