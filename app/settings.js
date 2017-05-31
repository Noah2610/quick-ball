
let ctrl = {
	//                       arrow keys
	up:			["W".charCodeAt(0), 38],
	down:		["S".charCodeAt(0), 40],
	left:		["A".charCodeAt(0), 37],
	right:	["D".charCodeAt(0), 39],
	action:	[" ".charCodeAt(0), "X".charCodeAt(0)]
};

let settings = {
	canvasWidth: 600,
	canvasHeight: 600,
	fps: 60,
	bgColor: 128,
	actionCooldown: 500,
	invulTime: 1000,

	playerSize: 32,
	playerColor: [
		Math.floor(Math.random() * 256),
		Math.floor(Math.random() * 256),
		Math.floor(Math.random() * 256)
	],
	playerStep: 4,
	playerTotalVertices: 8,
	playerRingDecr: 16,

	ringSize: 160,
	ringWidth: 2,
	ringColor: [255,128,0],
	ringInnerColor: [0,0,16,32],
	ringTotalVertices: 16,

	ballSize: 12,
	ballTotalVertices: 8,
	ballColor: [255,128,32],
	ballSpdMult: 1,
	ballSpdIncr: 0.25,
	ballSpawnRate: 60000
};
settings.playerRingIncr = Math.round(settings.playerRingDecr / 4);


export { settings, ctrl };

