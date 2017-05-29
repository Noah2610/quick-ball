
import express from "express";
import socket from "socket.io";
import chalk from "chalk";
import path from "path";
import datetime from "node-datetime";

const port = 7777;
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

let users = [];

io.sockets.on("connection", (socket) => {
	
	const IP = socket.handshake.address/*.substr(7)*/;
	const ID = socket.id;

	console.log(chalk.green(chalk.underline(curDate("H:M:S")) + " - connected: " + chalk.bold(ID + " - " + IP)));

	socket.on("addUser", (data) => {
		// give new connection its ID
		socket.emit("getInitData", { id: ID, players: users });
		// add new user to server's user array
		users.push({name: data.name, id: ID, x: data.x, y: data.y, color: data.color, size: data.size, ringSize: data.ringSize, dead: data.dead});
		// give every previously established connection the new player's data
		socket.broadcast.emit("addPlayerClient", users[users.length - 1]);
		//socket.broadcast.emit("addPlayerClient", data);
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
		socket.broadcast.emit("ballUpdateClient", data);
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
