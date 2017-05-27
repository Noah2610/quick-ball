
import io from "socket.io-client";
import "p5";

import { _player } from "./player";
import { _ball } from "./ball";

const port = 3000;
const socketAddr = "http://localhost:" + port;
let socket;
let Name = false;
let ID;
let players = [];
let Player;
let canAction = true;

//let ctrl;
//let settings;
//let canvas;

const bodyEl = document.querySelector("body");
const titleEl = document.querySelector("#inputTitle");
const nameEl = document.querySelector("input#inputName");
const submitEl = document.querySelector("input#inputSubmit");


window.setup = function() {

	window.gameStart = false;

	window.ctrl = {
		//                       arrow keys
		up:			["W".charCodeAt(0), 38],
		down:		["S".charCodeAt(0), 40],
		left:		["A".charCodeAt(0), 37],
		right:	["D".charCodeAt(0), 39],
		action:	[" ".charCodeAt(0), "X".charCodeAt(0)]
	};
	window.settings = {
		canvasWidth: 400,
		canvasHeight: 400,
		fps: 60,
		bgColor: 128,
		actionCooldown: 1000,

		playerSize: 24,
		playerColor: [
			Math.floor(Math.random() * 256),
			Math.floor(Math.random() * 256),
			Math.floor(Math.random() * 256),
			255
		],
		playerStep: 4,
		playerTotalVertices: 8,

		ringSize: 64,
		ringWidth: 1,
		ringColor: [255,128,0],
		ringInnerColor: [0,0,0,32],
		ringTotalVertices: 16,

		ballSize: 16,
		ballTotalVertices: 8
	};
	window.frameRate(settings.fps);
	window.canvas;
	// set following vars global from window
	//ctrl = window.ctrl;
	//settings = window.settings;
	//canvas = window.canvas;

	// delete default canvas
	//if (document.querySelector("canvas")) bodyEl.removeChild(document.querySelector("canvas"));
	noCanvas();

	// get user name
	nameEl.addEventListener("keydown", (e) => { if (e.key == "Enter") checkName(); });
	submitEl.addEventListener("click", checkName);

}


function checkName() {
	const name = nameEl.value;
	if (name != "") {
		Name = name;
		bodyEl.removeChild(titleEl);
		bodyEl.removeChild(nameEl);
		bodyEl.removeChild(submitEl);
		start();
	} else {
		titleEl.value = "Please enter a valid name:";
	}
}


function start() {
	gameStart = true;
	// create Player
	/*window.*/Player = new _player(Name, 0);
	players.push(Player);  // add this client to players

		// tmp; for browser console debugging
		//window.playerInterval = setInterval(function () { window.Player = Player }, 500);
		window.Player = Player;
		window.players = players;

	socket = io.connect(socketAddr);

	socket.emit("addUser", Player);  // add user to server

	// get socket ID for this client and all player information
	// this should only be executed once
	let safetyCounter = 0;
	socket.on("getInitData", (data) => {
			// for safety
			safetyCounter++;
			if (safetyCounter > 1) {
				console.log("getInitData WAS CALLED MORE THAN ONCE!!!!!!!!! (" + safetyCounter + ")\nTHIS SHOULD NEVER HAPPEN TO A CONNECTION!!!");
			}
		// set this client' ID
		ID = data.id;
		Player.id = ID;
		// populate players array
		data.players.forEach((player) => {
			players.push(new _player(player.name, player.id, player.x,player.y, player.color, player.size, player.ringSize));
		});
	});
	

	// receive new player
	socket.on("addPlayer", (data) => {
		//ID = data.id;
		//Player.id = ID;

		players.push(new _player(data.name, data.id, data.x,data.y, data.color, data.size, data.ringSize));
		console.log(players.length);
	});

	// update other Player(s)
	socket.on("playerUpdateClient", (data) => {
		players.forEach((player) => {
			if (data.id == player.id) {
				player.x = data.x;
				player.y = data.y;
				player.vertices = data.vertices;
				player.ringVertices = data.ringVertices;
				// MIGHT NEED TO ADD MORE HERE EVENTUALLY
			}
		});
	});

	// remove player
	socket.on("removePlayer", (id) => {
		players.forEach((player, index) => {
			if (player.id == id) players.splice(index,1);
		});
	});

	canvas = createCanvas(settings.canvasWidth, settings.canvasHeight);
	// show canvas, is hidden by default for some reason
	const canvasDOM = document.querySelector("canvas");
	canvasDOM.setAttribute("data-hidden", "false");
	canvasDOM.style.visibility = "";
	background(settings.bgColor);

}


//function keyPressed() { window.preventDefault(); };

function checkKey(key) {
	return keyIsDown(key);
}

function checkControls() {
	let hasMoved = false;
	if (ctrl.up.some(checkKey) && !ctrl.down.some(checkKey)) {  // up
		Player.y -= settings.playerStep;
		hasMoved = true;
	} else
	if (ctrl.down.some(checkKey) && !ctrl.up.some(checkKey)) {  // down
		Player.y += settings.playerStep;
		hasMoved = true;
	}
	if (ctrl.left.some(checkKey) && !ctrl.right.some(checkKey)) {  // left
		Player.x -= settings.playerStep;
		hasMoved = true;
	} else
	if (ctrl.right.some(checkKey) && !ctrl.left.some(checkKey)) {  // right
		Player.x += settings.playerStep;
		hasMoved = true;
	}
	// CHANGE THIS TO USE SAME FUNCTION AS ABOVE
	if (canAction && ctrl.action.some(checkKey)) {  // action
		Player.action();

		canAction = false;
		setTimeout(() => { canAction = true; }, settings.actionCooldown);
	}

	if (hasMoved) {
		Player.vertices = getVertices(Player.x,Player.y,Player.size, settings.playerTotalVertices);
		Player.ringVertices = getVertices(Player.x,Player.y,Player.ringSize, settings.ringTotalVertices);
		sendPlayerData();
	}

}

function sendPlayerData() {
	socket.emit("playerUpdate", Player);
}


window.getVertices = function(x,y,size,totalVertices) {

	let vertices = [];
	const incr = Math.round(360 / totalVertices);

	for (let deg = 0; deg < 360; deg += incr) {
		const rad = deg * (Math.PI / 180)
		const pX = x + ((size / 2) * Math.cos(rad));
		const pY = y + ((size / 2) * Math.sin(rad));
		vertices.push({x: pX, y: pY});
	}
	
	return vertices;

};

function showVertices(vertices) {
	fill(255,0,0);
	noStroke();
	ellipseMode(CENTER);
	for (let count = 0; count < vertices.length; count++) {
		ellipse(vertices[count].x,vertices[count].y, 4);
	}
}


window.tmp = function () {
	collide({x:Player.x,y:Player.y}, Player.vertices, false,false);
};

//              { x,y }, [{x,y},...]
function collide(center1, vertices1, center2, vertices2) {
	
	//vertices1.forEach((v1,i1) => {

	const v1 = vertices1[0];
	const dist2d = {
		x: getPositive(center1.x - v1.x),
		y: getPositive(center1.y - v1.y)
	};
	
	console.log(dist2d);

	noStroke()
	fill(255,0,0);
	ellipse(dist2d.x,dist2d.y,2);

	// determine where vertice is relative to center point
	//const pos1 = collideWhere(center1, v1);
	//console.log(i1 + ": " + pos1);

		//vertices2.forEach((v2,i2) => {
//
//
		//});
		
	//});

}

function getPositive(num) {
	if (num < 0) num *= -1;
	return num;
}

function collideWhere(center, vertice) {
/*
	determine where vertice is relative to center point
	return values:
		"center",
		"up", "down", "left", "right",
		"up-left", "up-right",
		"down-left", "down-right"
*/


	let h; let v;

	// center
	if (vertice.x == center.x && vertice.y == center.y) return "center";
	else
	// horizontal
	if (vertice.x < center.x) h = "left";
	else
	if (vertice.x > center.x) h = "right";
	// vertical
	if (vertice.y < center.y) v = "up";
	else
	if (vertice.y > center.y) v = "down";

	if (h !== undefined && v !== undefined)
		return v + "-" + h;
	else if (h === undefined) return v;
	else if (v === undefined) return h;

	//// same y-axis
	//if (vertice.y == center.y) {
		//// center
		//if (vertice.x == center.x) return "center";
		//else
		//// left
		//if (vertice.x < center.x) return "left";
		//else
		//// right
		//if (vertice.x > center.x) return "right";
	//} else
	//// same x-axis
	//if (vertice.x == center.x) {
		//// left
		//if (vertice.y < center.y) return "up";
		//else
		//// right
		//if (vertice.y > center.y) return "down";
	//} else
//
	//// up
	//if (vertice.y < center.y) {
//
		//// up-left
		//if (vertice.x < center.x) {
			//return "up-left";
		//}
//
	//}
}


window.draw = function() {
	//background(settings.bgColor);

	// controls
	if (gameStart && keyIsPressed === true) checkControls();

	// draw players
	for (let countPlayer = players.length - 1; countPlayer >= 0; countPlayer--) {
		//players[countPlayer].show();
		showVertices(players[countPlayer].vertices);
		//showVertices(players[countPlayer].ringVertices);
	}
};

