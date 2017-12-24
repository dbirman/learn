
var spk_rate = 2;
var spk = zeros(200);

var stick,
    spikes = [],
    spike_false = [0,0,0,0,0],
    spike_true = [5,50,-10,-5,-2],
    cur_spk = 0;

function spk_init() {
  for (var i=0;i<50;i++) {
      spikes.push(new Audio("../assets/snd/spike.wav"));
  }
}

// Add a new spike trace
function spk_addTrace() {
  trace = {};
  trace.rate = 0; // average firing rate per second
  trace.spk = zeros(200);
  trace.tick;

  _spk_spike(trace);

  return trace;
}

function spk_setRate(trace,rate) {
  trace.rate = rate;
  if (rate > 0) {
    _spk_spike(trace);
  }
}

function _spk_spike(trace) {
  // check the stop condition
  if (trace.rate <= 0) {clearTimeout(trace.tick); return}
  // Repeat the code
  trace.tick = setTimeout(function() {_spk_spike(trace);},5);
  if (Math.random() < trace.rate / 200) {
    _spk_play();
    for (var i=0;i<5;i++) {trace.spk.shift(); trace.spk.push(spike_true[i]+randn()*2);}
  } else {
    for (var i=0;i<5;i++) {trace.spk.shift(); trace.spk.push(spike_false[i]+randn()*2);}
  }
}

function _spk_play() {
  spikes[cur_spk].play();
  cur_spk += 1; if(cur_spk>=spikes.length) {cur_spk=0;}
}