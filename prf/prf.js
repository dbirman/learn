
// 	// red: CD6155
// 	// blue: 5DADE2
// 	// purple: 6155cd

////////////////////////////////
////////// BLOCK 2 /////////////
////////////////////////////////



////////////////////////////////
////////// END CODE /////////////
////////////////////////////////

function run(i) {	
	$("#continue").show();
	clearTimeout(to);
	// cancelAnimationFrame(tick4);
	cancelAnimationFrame(tickBrain);
	// cancelAnimationFrame(tick6);
	// Runs each time a block starts incase that block has to do startup
	switch(i) {
		case 2:
			if (!done2) {$("#continue").hide();run2();}
			break;
		case 4:
			$("#part24").hide(); 
			if (!(done4==2)) {$("#continue").hide();launch4();}
			break;
		case 5:
			// todo
			elapsed();
			drawBrain();
			break;
		case 6:
			run5();
			break;
		case 7:
			// init6();
			// run6();
			break;
	}
}

function launch_local() {
	katex.render("A=0",document.getElementById("katex1"),{displayMode:true});	
	katex.render("RPE=R-A_{v}",document.getElementById("katex2"),{displayMode:true});	
	katex.render("A_{v+1}=A_{v} + \\alpha(R-A_{v})",document.getElementById("katex3"),{displayMode:true});	
	katex.render("A",document.getElementById("katex3-1"),{displayMode:false});
	katex.render("A",document.getElementById("katex3-2"),{displayMode:false});
	katex.render("A",document.getElementById("katex3-4"),{displayMode:false});
	katex.render("_{v}",document.getElementById("katex3-3"),{displayMode:false});
	katex.render("A_{v}",document.getElementById("katex5-1"),{displayMode:false});
	katex.render("A_{v}",document.getElementById("katex5-2"),{displayMode:false});
	katex.render("A_{v}",document.getElementById("katex5-3"),{displayMode:false});
	katex.render("A_{v}",document.getElementById("katex5-4"),{displayMode:false});
	// katex.render("A_{v}=1,B_{v}=2,C_{v}=3",document.getElementById("katex6"),{displayMode:true});	
	// katex.render("P(A)=A>B \\& B>C",document.getElementById("katex6-2"),{displayMode:true});	
	// katex.render("P(A)=\\dfrac{A_{v}}{A_{v}+B_{v}+C_{v}}",document.getElementById("katex6-3"),{displayMode:true});	
	$("#end4").hide();
	resetTraces5();
	initBrain();
	// init6();
	sqImg_red.src = 'images/squirrel_red.png';
	sqImg_blue.src = 'images/squirrel_blue.png';
	sqImg_purple.src = 'images/squirrel_purple.png';
}



function randint(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max)+1;
  return Math.floor(Math.random() * (max - min)) + min;
}

function indexOfMax(arr) {
    if (arr.length === 0) {
        return -1;
    }

    var max = arr[0];
    var maxIndex = 0;

    for (var i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            maxIndex = i;
            max = arr[i];
        }
    }

    return maxIndex;
}

var eventClick;

function updateCanvasClick(evt) {
  evt.preventDefault();
  var canvas = evt.target;
  var out = updateCanvas(evt,canvas);
  eventClick(out[0],out[1],evt.shiftKey);
}

function updateCanvas(evt,canvas) {
  var rect = canvas.getBoundingClientRect(), // abs. size of element
    scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for X
    scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y

  var x =  (evt.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
    y =  (evt.clientY - rect.top) * scaleY     // been adjusted to be relative to element
  return [x,y];
}