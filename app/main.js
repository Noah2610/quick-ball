
import "babel-polyfill";
import io from "socket.io-client";
import "p5";


import { _player } from "./player";
import { _ball } from "./ball";

const port = 7777;
const socketAddr = "http://noahro.dynu.com:" + port;
let Name = false;
let ID;
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
		canvasWidth: 800,
		canvasHeight: 800,
		fps: 60,
		bgColor: 128,
		actionCooldown: 250,
		invulTime: 1000,

		playerSize: 24,
		playerColor: [
			Math.floor(Math.random() * 256),
			Math.floor(Math.random() * 256),
			Math.floor(Math.random() * 256)
		],
		playerStep: 4,
		playerTotalVertices: 8,
		playerRingDecr: 16,

		ringSize: 128,
		ringWidth: 1,
		ringColor: [255,128,0],
		ringInnerColor: [0,0,0,32],
		ringTotalVertices: 16,

		ballSize: 10,
		ballTotalVertices: 8,
		ballColor: [255,128,32],
		ballSpdMult: 1,
		ballSpdIncr: 0.25
	};
	window.frameRate(settings.fps);
	window.canvas;
	//window.socket;
	window.players = [];
	window.balls = [];
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

	window.socket = io.connect(socketAddr);

	socket.emit("addUser", Player);  // add user to server

	// get socket ID for this client and all player information
	// this should only be executed once
	let safetyCounter = 0;
	socket.on("getInitData", (data) => {
		// set this client' ID
		ID = data.id;
		Player.id = ID;
		// populate players array
		data.players.forEach((player) => {
			players.push(new _player(player.name, player.id, player.x,player.y, player.color, player.size, player.ringSize, player.dead));
		});
	});
	

	// receive new player
	socket.on("addPlayerClient", (data) => {
		//ID = data.id;
		//Player.id = ID;

		players.push(new _player(data.name, data.id, data.x,data.y, data.color, data.size, data.ringSize));
	});

	socket.on("addBall", (data) => {
		balls.push(new _ball(data));
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

	// a player has hit action
	socket.on("playerActionClient", (data) => {
		players.forEach((player) => {
			if (player.id == data) {
				player.actionShow();
			}
		});
	});

	socket.on("playerHitClient", (data) => {
		players.forEach((player) => {
			if (player.id == data.id) {
				player.ringSize = data.ringSize;
				player.invul = true;
				setTimeout(() => { player.invul = false; }, settings.invulTime);
			}
		});
	});

	socket.on("playerDeathClient", (data) => {
		players.forEach((player) => {
			if (player.id == data) {
				player.dead = true;
			}
		});
	});

	socket.on("ballUpdateClient", (data) => {
		balls[data.i].x = data.ball.x;
		balls[data.i].y = data.ball.y;
		balls[data.i].mvDir = data.ball.mvDir;
		balls[data.i].spdMult = data.ball.spdMult;
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
	
	balls.push(new _ball());

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

		socket.emit("playerAction", Player.id);
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


window.collide = function(instance1, instance2) {
	
	const center1 = { x: instance1.x, y: instance1.y };
	const center2 = { x: instance2.x, y: instance2.y };

	const dist = getDist(center1, instance1.vertices[0]);

	if (getDist(center1, center2) <= dist) return true;
	return instance2.vertices.some((v,i) => {
		return getDist(center1, v) <= dist;
	});

}

window.getDist = function (a,b) {
	return Math.sqrt(Math.pow(a.x - b.x,2) + Math.pow(a.y - b.y,2));
}


window.draw = function() {
	if (gameStart) {
		background(settings.bgColor);

		// controls
		if (!Player.dead && keyIsPressed === true) checkControls();

		// draw ball(s)
		for (let countBalls = 0; countBalls < balls.length; countBalls++) {
			balls[countBalls].move();
			balls[countBalls].show();
		}

		// draw players
		for (let countPlayer = players.length - 1; countPlayer >= 0; countPlayer--) {
			if (!players[countPlayer].dead)
				players[countPlayer].show();
			//showVertices(players[countPlayer].vertices);
			//showVertices(players[countPlayer].ringVertices);
		}

		// collision check for this client only
		if (!Player.dead && Player) Player.collision();
	}
};

