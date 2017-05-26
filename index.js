
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

let users = [];

io.sockets.on("connection", (socket) => {
	
	const IP = socket.handshake.address/*.substr(7)*/;
	const ID = socket.id;

	console.log(chalk.green(chalk.underline(curDate("H:M:S")) + " - connected: " + chalk.bold(ID + " - " + IP)));

	socket.on("addUser", (data) => {
		socket.emit("setUsers", {id: ID, users: users});
		users.push({name: data.name, id: ID, x: 0, y: 0});
		console.log(chalk.cyan(JSON.stringify(data)));
	});

	socket.on("playerUpdate", (data) => {
		socket.emit("playerUpdateClient", data);
	})


	socket.on("disconnect", () => {
		console.log(chalk.red(chalk.underline(curDate("H:M:S")) + " - disconnected: " + chalk.bold(ID + " - " + IP)));
		users.forEach((user, index) => {
			if (user.id == ID) users.splice(index,1);
		});
	});

});



function curDate(frmt) {
	return datetime.create().format(frmt);
}
