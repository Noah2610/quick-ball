
import express from "express";
import socket from "socket.io";
import chalk from "chalk";
import path from "path";
import datetime from "node-datetime";

const port = 3000;
const app = express();
const server = app.listen(port);
const io = socket(server);

console.log(chalk.green.bold("server running on port " + port));

app.get("/", (req,res) => {
	res.sendFile(path.resolve(__dirname, "public/index.html"));
});

app.get("/res/*", (req,res) => {
	const file = req.url.replace("/res", "public");
	console.log(chalk.blue("resource: " + file));
	res.sendFile(path.resolve(__dirname, file));
});

//app.get("/tmp/*", (req,res) => {
	//const file = req.url.replace("/tmp/", "");
	//console.log(chalk.blue("resource: " + file));
	//res.sendFile(path.resolve(__dirname, file));
//});

import { settings as settingsClient, ctrl as ctrlClient } from "./app/settings";

let users = [];
let balls = [];
let ballInterval;
let initBallSpawned = false;

io.sockets.on("connection", (socket) => {
	
	const IP = socket.handshake.address/*.substr(7)*/;
	const ID = socket.id;

	console.log(chalk.green(chalk.underline(curDate("H:M:S")) + " - connected: " + chalk.bold(ID + " - " + IP)));


	// add ball if 2 players are connected
	function newBall() {
		const bID = balls.length;
		const bDelay = 500 * balls.length + 1;
		const bMvDir = [
			Math.round((Math.random() + 1) * ((balls.length + 1) / 2)),
			Math.round((Math.random() + 1) * ((balls.length + 1) / 2))
		];
			// 50% chance for a mvDir direction to be negativ
			for (let count = 0; count < 2; count++)
				if (Math.round(Math.random()) == 1) bMvDir[count] *= -1
		const bX = Math.round(Math.random() * settingsClient.canvasWidth);
		const bY = Math.round(Math.random() * settingsClient.canvasHeight);
		const bSpdMult = settingsClient.ballSpdMult * (balls.length + 1);

		balls.push({ id: bID, delay: bDelay, mvDir: bMvDir, x: bX, y: bY, spdMult: bSpdMult});
		const b = balls[balls.length -1];
		io.sockets.emit("addBallClient", ([ b.id, b.delay, b.mvDir, b.x, b.y, b.spdMult ]));
	}


	socket.on("addUser", (data) => {
		// give new connection its ID
		socket.emit("getInitData", { id: ID, players: users, balls: balls });
		// add new user to server's user array
		users.push({name: data.name, id: ID, x: data.x, y: data.y, color: data.color, size: data.size, ringSize: data.ringSize, dead: data.dead});
		// give every previously established connection the new player's data
		socket.broadcast.emit("addPlayerClient", users[users.length - 1]);
		//socket.broadcast.emit("addPlayerClient", data);

		// add ball if 2 players are connected
		if (users.length == 2 && !initBallSpawned) {
			initBallSpawned = true;
			newBall();
			ballInterval = setInterval(newBall, settingsClient.ballSpawnRate);
		}
	});

	//socket.on("addPlayer", (data) => {
		//// give every previously established connection the new player's data
		//socket.broadcast.emit("addPlayerClient", data);
	//});

	socket.on("playerUpdate", (data) => {
		socket.broadcast.emit("playerUpdateClient", data);
		users.forEach((user) => {
			if (user.id == data.id) {
				user.x = data.x;
				user.y = data.y;
			}
		});
	});

	socket.on("playerAction", (data) => {
		socket.broadcast.emit("playerActionClient", data);
	});

	socket.on("playerHit", (data) => {
		socket.broadcast.emit("playerHitClient", data);
		users.forEach((user) => {
			if (user.id == data.id) {
				user.ringSize = data.ringSize;
			}
		});
	});

	socket.on("playerGain", (data) => {
		socket.broadcast.emit("playerGainClient", data);
		users.forEach((user) => {
			if (user.id == data.id) {
				user.ringSize = data.ringSize;
			}
		});
	});

	socket.on("playerDeath", (data) => {
		socket.broadcast.emit("playerDeathClient", data);
		users.forEach((user) => {
			if (user.id == data.id) {
				user.dead = true;
			}
		});
	});

	socket.on("ballUpdate", (data) => {
		balls.forEach((ball) => {
			if (data.id == ball.id) {
				ball.x = data.x;
				ball.y = data.y;
				ball.mvDir = data.mvDir;
				ball.spdMult = data.spdMult;
				socket.broadcast.emit("ballUpdateClient", ball);
			}
		});
	});


	socket.on("disconnect", () => {
		// REMOVE USER FROM users ARRAY AND TELL EVERY CONNECTION
		console.log(chalk.red(chalk.underline(curDate("H:M:S")) + " - disconnected: " + chalk.bold(ID + " - " + IP)));
		users.forEach((user, index) => {
			if (user.id == ID) users.splice(index,1);
			socket.broadcast.emit("removePlayer", ID);
		});
	});

});



function curDate(frmt) {
	return datetime.create().format(frmt);
}
