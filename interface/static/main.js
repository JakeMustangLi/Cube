var state = [];
var mystate = [];
var rotateIdxs_old = null;
var rotateIdxs_new = null;
var stateToFE = null;
var FEToState = null;
var legalMoves = null;

var solveStartState = [];
var solveMoves = [];
var solveMoves_rev = [];
var solution_text = null;

var colorMap = {0: "#ffffff", 1: "#ffff1a", 4: "#0000ff", 5: "#33cc33", 2: "#ff8000",3: "#e60000"};
var lastMouseX = 0,
  lastMouseY = 0;
var rotX = -30,
  rotY = -30;

var moves = []
var mymoves = []
var solveIdx = null;
var mysolveIdx = null;
var faceNames = ["top", "bottom", "left", "right", "back", "front"];
var myfaceNames = ["mytop", "mybottom", "myleft", "myright", "myback", "myfront"];


function reOrderArray(arr,indecies) {
	var temp = []
	for(var i = 0; i < indecies.length; i++) {
		var index = indecies[i]
		temp.push(arr[index])
	}

	return temp;
}

/*
	Rand int between min (inclusive) and max (exclusive)
*/
function randInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

function clearCube() {
  for (i = 0; i < faceNames.length; i++) {
    var Node = document.getElementById(faceNames[i]);
    while (Node.firstChild) {
      Node.removeChild(Node.firstChild);
    }
  }
}
function clearmyCube() {
  for (i = 0; i < myfaceNames.length; i++) {
    var myNode = document.getElementById(myfaceNames[i]);
    while (myNode.firstChild) {
      myNode.removeChild(myNode.firstChild);
    }
  }
}
function setStickerColors(newState) {
	state = newState
  clearCube()
  idx = 0
  for (i = 0; i < faceNames.length; i++) {
    for (j = 0; j < 9; j++) {
      var iDiv = document.createElement('div');
      iDiv.className = 'sticker';
      iDiv.style["background-color"] = colorMap[Math.floor(newState[idx]/9)]
      document.getElementById(faceNames[i]).appendChild(iDiv);
      idx = idx + 1
    }
  }
}
function setmyStickerColors(newState) {
	mystate = newState
  clearmyCube()
  idx = 0
  for (i = 0; i < faceNames.length; i++) {
    for (j = 0; j < 9; j++) {
      var myiDiv = document.createElement('div');
      myiDiv.className = 'mysticker';
      myiDiv.style["background-color"] = colorMap[Math.floor(newState[idx]/9)]
      document.getElementById(myfaceNames[i]).appendChild(myiDiv);
      idx = idx + 1
    }
  }
}

function buttonPressed(ev) {
	var face = ''
	var direction = '1'
	if (ev.shiftKey) {
		direction = '-1'
	}
	if (ev.which == 85 || ev.which == 117) {
		face='U'
	} else if (ev.which == 68 || ev.which == 100) {
		face = 'D'
	} else if (ev.which == 76 || ev.which == 108) {
		face = 'L'
	} else if (ev.which == 82 || ev.which == 114) {
		face = 'R'
	} else if (ev.which == 66 || ev.which == 98) {
		face = 'B'
	} else if (ev.which == 70 || ev.which == 102) {
		face = 'F'
	}
	if (face != '') {
		//clearSoln();
		mymoves.push(face + "_" + direction)
		nextState(0,false,true);
	}
}


function enableScroll() {
	document.getElementById("first_state").disabled=false;
	document.getElementById("prev_state").disabled=false;
	document.getElementById("next_state").disabled=false;
	document.getElementById("last_state").disabled=false;
}

function disableScroll() {
	document.getElementById("first_state").blur(); //so keyboard input can work without having to click away from disabled button
	document.getElementById("prev_state").blur();
	document.getElementById("next_state").blur();
	document.getElementById("last_state").blur();

	document.getElementById("first_state").disabled=true;
	document.getElementById("prev_state").disabled=true;
	document.getElementById("next_state").disabled=true;
	document.getElementById("last_state").disabled=true;
}

/*
	Clears solution as well as disables scroll
*/
function clearSoln() {
	solveIdx = 0;
	mysolveIdx = 0;
	solveStartState = [];
	solveMoves = [];
	solveMoves_rev = [];
	solution_text = null;
	document.getElementById("solution_text").innerHTML = "Solution:";
	disableScroll();
}

function setSolnText(setColor=true) {
	solution_text_mod = JSON.parse(JSON.stringify(solution_text))
	if (solveIdx >= 0) {
		if (setColor == true) {
			solution_text_mod[solveIdx] = solution_text_mod[solveIdx].bold().fontcolor("blue")
		} else {
			solution_text_mod[solveIdx] = solution_text_mod[solveIdx]
		}
	}
	document.getElementById("solution_text").innerHTML = "Solution: "+ solution_text_mod.join(" ");
}

function enableInput() {
	document.getElementById("scramble").disabled=false;
	document.getElementById("solve").disabled=false;
	$(document).on("keypress", buttonPressed);
}

function disableInput() {
	document.getElementById("scramble").disabled=true;
	document.getElementById("solve").disabled=true;
	$(document).off("keypress", buttonPressed);
}

function nextState(moveTimeout=0, flag1=true, flag2=true) {
	if ((moves.length > 0 && flag1)||(mymoves.length > 0 && flag2)) {
		disableInput();
		disableScroll();
		console.log("moves:",moves);
		console.log("mymoves",mymoves);
		if (flag1){
			move1 = moves.shift() // get Move
			console.log("move1:",move1);
		}
		if (flag2){
			move2 = mymoves.shift() // get Move
			console.log("move2:",move2);
		}
		
		//convert to python representation
		if (flag1){
			state_rep1 = reOrderArray(state,FEToState)
		    newState_rep1 = JSON.parse(JSON.stringify(state_rep1))
		}
		if (flag2){
			state_rep2 = reOrderArray(mystate,FEToState)
		    newState_rep2 = JSON.parse(JSON.stringify(state_rep2))
		}
		//swap stickers
		if (flag1){
			for (var i = 0; i < rotateIdxs_new[move1].length; i++) {
				newState_rep1[rotateIdxs_new[move1][i]] = state_rep1[rotateIdxs_old[move1][i]]
		    }
		}
		if (flag2){
			for (var i = 0; i < rotateIdxs_new[move2].length; i++) {
				newState_rep2[rotateIdxs_new[move2][i]] = state_rep2[rotateIdxs_old[move2][i]]
		    }
		}

		// Change move highlight
		if (moveTimeout != 0){ //check if nextState is used for first_state click, prev_state,etc.
			    if (flag1){
			    	solveIdx++
					setSolnText(setColor=true)
				}
			    if (flag2){
			    	mysolveIdx++
			    }
		}

		//convert back to HTML representation
		// newState1 = reOrderArray(newState_rep1,stateToFE)
		// newState2 = reOrderArray(newState_rep2,stateToFE)
		//set new state
		if (flag1){
			newState1 = reOrderArray(newState_rep1,stateToFE)
			setStickerColors(newState1)
		}
		if (flag2){
			newState2 = reOrderArray(newState_rep2,stateToFE)
			setmyStickerColors(newState2)
		}


		//Call again if there are more moves
		if ((moves.length > 0 && flag1)||(mymoves.length > 0 && flag2)) {
			//nextState(moveTimeout,flag1,flag2);
			setTimeout(function(){nextState(moveTimeout,flag1,flag2)}, moveTimeout);
		} else {
			enableInput();
			if (solveMoves.length > 0) {
				enableScroll();
				setSolnText();
			}
		}
	} else {
		enableInput();
		if (solveMoves.length > 0) {
			enableScroll();
			setSolnText();
		}
	}
}

function scrambleCube() {
	disableInput();
	clearSoln();

	numMoves = randInt(100,200);
	for (var i = 0; i < numMoves; i++) {
		temp_move = legalMoves[randInt(0,legalMoves.length)];
		moves.push(temp_move);
		mymoves.push(temp_move);
		// moves.push(legalMoves[randInt(0,legalMoves.length)]);
		// mymoves.push(legalMoves[randInt(0,legalMoves.length)]);
	}
	nextState(0,true,true);
}

function solveCube() {
	disableInput();
	clearSoln();
	document.getElementById("solution_text").innerHTML = "SOLVING..."
	$.ajax({
		url: '/solve',
		data: {"state": JSON.stringify(state)},
		type: 'POST',
		dataType: 'json',
		success: function(response) {
			solveStartState = JSON.parse(JSON.stringify(state))
			solveMoves = response["moves"];
			solveMoves_rev = response["moves_rev"];
			solution_text = response["solve_text"];
			solution_text.push("SOLVED!")
			setSolnText(true);

			// moves = JSON.parse(JSON.stringify(solveMoves));
			enableScroll();
			//setTimeout(function(){nextState(500)}, 500);
		},
		error: function(error) {
				console.log(error);
				document.getElementById("solution_text").innerHTML = "..."
				setTimeout(function(){solveCube()}, 500);
		},
	});
}

$( document ).ready($(function() {
	disableInput();
	clearSoln();
	$.ajax({
		url: '/initState',
		data: {},
		type: 'POST',
		dataType: 'json',
		success: function(response) {
			setStickerColors(response["state"]);
			setmyStickerColors(response["state"]);
			rotateIdxs_old = response["rotateIdxs_old"];
			rotateIdxs_new = response["rotateIdxs_new"];
			stateToFE = response["stateToFE"];
			FEToState = response["FEToState"];
			legalMoves = response["legalMoves"]
			enableInput();
		},
		error: function(error) {
			console.log(error);
		},
	});

	$("#cube").css("transform", "translateZ( -100px) rotateX( " + rotX + "deg) rotateY(" + rotY + "deg)"); //Initial orientation
	$("#mycube").css("transform", "translateZ( -100px) rotateX( " + rotX + "deg) rotateY(" + rotY + "deg)"); //Initial orientation

	$('#scramble').click(function() {
		scrambleCube()
	});

	$('#solve').click(function() {
		solveCube()
	});

	$('#first_state').click(function() {
		if (solveIdx > 0) {
			moves = solveMoves_rev.slice(0, solveIdx).reverse();
			solveIdx = 0;
			mysolveIdx = 0;
			mymoves = moves.concat();
			mystate = state.concat();
			nextState(0,true,true);
		}
	});

	$('#prev_state').click(function() {
		if (solveIdx > 0) {
			solveIdx = solveIdx - 1
			moves.push(solveMoves_rev[solveIdx])
			nextState(0,true,false)
		}
	});

	$('#next_state').click(function() {
		if (solveIdx < solveMoves.length) {
			moves.push(solveMoves[solveIdx])
			solveIdx = solveIdx + 1
			nextState(0,true,false)
		}
	});

	$('#last_state').click(function() {
		if (solveIdx < solveMoves.length) {
			moves = solveMoves.slice(solveIdx, solveMoves.length);
			solveIdx = solveMoves.length;
			mymoves = moves.concat();
			mysolveIdx = solveMoves.length;
			mystate = state.concat();
			nextState(0,true,true);
		}
	});

	$('#cube_div').on("mousedown", function(ev) {
		lastMouseX = ev.clientX;
		lastMouseY = ev.clientY;
		$('#cube_div').on("mousemove", mouseMoved);
	});
	$('#cube_div').on("mouseup", function() {
		$('#cube_div').off("mousemove", mouseMoved);
	});
	$('#cube_div').on("mouseleave", function() {
		$('#cube_div').off("mousemove", mouseMoved);
	});
	$('#mycube_div').on("mousedown", function(ev) {
		lastMouseX = ev.clientX;
		lastMouseY = ev.clientY;
		$('#mycube_div').on("mousemove", mouseMoved);
	});
	$('#mycube_div').on("mouseup", function() {
		$('#cube_div').off("mousemove", mouseMoved);
	});
	$('#mycube_div').on("mouseleave", function() {
		$('#mycube_div').off("mousemove", mouseMoved);
	});

	console.log( "ready!" );
}));


function mouseMoved(ev) {
  var deltaX = ev.pageX - lastMouseX;
  var deltaY = ev.pageY - lastMouseY;

  lastMouseX = ev.pageX;
  lastMouseY = ev.pageY;

  rotY += deltaX * 0.2;
  rotX -= deltaY * 0.5;

  $("#cube").css("transform", "translateZ( -100px) rotateX( " + rotX + "deg) rotateY(" + rotY + "deg)");
  $("#mycube").css("transform", "translateZ( -100px) rotateX( " + rotX + "deg) rotateY(" + rotY + "deg)");
}

