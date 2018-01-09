// SHARED RF CODE

// This code deals with the logic behind the receptive field calculations
// it translates between the full coordinate space of whatever is on the screen
// into a lower-dimension space. In that lower dimension space it computes
// the dot product of the current receptive field (a gaussian, wavelet, etc)
// with the current stimulus. 

// See shared_encoding for a model that computes based on just the features
// present and not the actual pixel-by-pixel values.

// Global variables
var ocoords = [0,0,0,0],
	icoords = [0,0,50,50],
	center = [(icoords[2]/2),icoords[3]/2],
	rf_length = icoords[2]*icoords[3];

// Track the actual receptive fields for each location
var rfs = [],
	rf_inits = [rf_gauss, rf_mexhat, rf_wavelet2d];

// Track the mouse position and current stimulus
var mouse = {},
	stim = {};

// Create a grid 
function rf_init() {
	for (var ri=0;ri<rf_inits;ri++) {
		// generate for every grid coordinate a receptive field
		local_rfs = [];
		for (var yi=0;yi<icoords[3];yi++) {
			for (var xi=0;xi<icoords[2];xi++) {
				local_rfs.push(rf_inits[ri](yi,xi));
			}
		}
		rfs.push(local_rfs); // note indexing
	}
}

///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
//////////// RECEPTIVE FIELD INIT FUNCTIONS ///////////////
///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////

// Each receptive field defines a rectangular mask (to reduce dot product)
// and a set of values that control the RF strength
// at each location. The RF sum is normalized to 1.

// Each actual receptive field can be jittered slightly 

// RETINA
// Receptive fields are spatiotopic, gaussian, on/off, and sustained/transient
function rf_gauss(xi,yi) {
	// xi, yi control the center
	var rf = rf_default();


	return rf;
}

function rf_mexhat(xi,yi) {

}

function rf_wavelet2d(xi,yi) {

}

function rf_default() {
	var rf = {};
	rf.mask = icoords;
	rf.field = zeros(rf_length);
	rf.props = {}; // special properties (e.g. on/off, transient/sustained)
}

// Calculate the mask and normalize
function rf_finalize() {
	// Mask calculation

	// Normalization
}