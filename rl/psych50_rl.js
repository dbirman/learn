
////////////////////////////////
////////// BLOCK 2 /////////////
////////////////////////////////

var done2 = false;

function run2() {
	document.addEventListener("keydown",function( event ) {key2(event);});
}

var order = [38,38,40,40,37,39,37,39,66,65];
var on =0 ;

function key2(event) {
	var k = event.which;
	if (k==order[on]) {event.preventDefault();on++;} else {on=0;}
	if (on==order.length) {$("#dpsquirrel").show();$("#dpsquirrel").fadeOut(2000);$("#continue").show();done2=true;document.removeEventListener("keydown",key2);}
}

////////////////////////////////
////////// BLOCK 4 /////////////
////////////////////////////////

function run(i) {	
	$("#continue").show();
	// Runs each time a block starts incase that block has to do startup
	switch(i) {
		case 2:
			if (!done2) {$("#continue").hide();run2();}
			break;
	}
}



function launch_local() {
	katex.render("A=0",document.getElementById("katex1"),{displayMode:true});	
	katex.render("RPE=R-A_{v}",document.getElementById("katex2"),{displayMode:true});	

}