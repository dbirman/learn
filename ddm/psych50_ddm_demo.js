
////////////////////////////////
////////// ANIMATION /////////////
////////////////////////////////

var tick;

function running() {

}

///////////////////////////////////
////////// LOCAL CODE /////////////
///////////////////////////////////

var done2 = false;

function stopMotion() {
	window.cancelAnimationFrame(tick1);
}

function run(i) {
	stopMotion();				
	document.getElementById("continue").style.display="";
	// Runs each time a block starts incase that block has to do startup
	switch(i) {
		case 2:
			if (!done2) {
				// least squares fitting: hide continue and leastsquares answer panels
				document.getElementById("continue").style.display="none";
				document.getElementById("leastsquares_hidden1").style.display="none";		
				start2();
			}
			break;
 }
}

var rs_data;

function read_RS_CSV(file) {
	rs_data = {};
	var data = $.csv.toArrays(file);
	rs_data.coherence = [0,.032,.064,.128,.256,.512];
	rs_data.correct = {}; rs_data.incorrect = {};
	rs_data.correct.x = createArray(6,0);
	rs_data.correct.y = createArray(6,0);
	rs_data.incorrect.x = createArray(6,0);
	rs_data.incorrect.y = createArray(6,0);
	 copts = ['incorrect','correct'];
	for (var i=0;i<data.length;i++) {
		 ccoh = data[i][3];
		 ccorr = data[i][2];
		 cx = data[i][0];
		 cy = data[i][1];
		for (var j=0;j<6;j++) {
			if (ccoh==rs_data.coherence[j]) {
				rs_data[copts[ccorr]].x[j].push(Number(cx));
				rs_data[copts[ccorr]].y[j].push(Number(cy));
			}
		}
	}
	drawPlot9(rs_data);
}

function launch_local() {
	// katex.render("y(t)=y_{0}+v_{y}t+\\frac{1}{2}at^{2}",document.getElementById("katex1"),{displayMode:true});
	// katex.render("y(t)=y_{0}+v_{y}t+\\frac{1}{2}at^{2}",document.getElementById("katex2"),{displayMode:true});	
	katex.render("A(t)=\\sum_{i=0}^{t} left(i)-right(i)",document.getElementById("katex3"),{displayMode:true});	
	katex.render("Response(coherence) = f(coherence) + \\epsilon",document.getElementById("katex4"),{displayMode:true});	
	drawPlot1();
	drawPlot2();
	document.getElementById("bonus1").style.display="none";
	document.getElementById("end6").style.display="none";
	document.getElementById("end7").style.display="none";
	$.ajax({ url: "roitmanshadlen2002.csv", success: function(file_content) {
    read_RS_CSV(file_content);
	  }
	});
}

