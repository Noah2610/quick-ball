
import io from "socket.io-client";
import "p5";

import {Player} from "./player";
//import {Ball} from "./ball";

const port = 3000;
const socketAddr = "http://localhost:" + port;
let socket;
let Name = false;
let ID;
let users = [];
let player;


const bodyEl = document.querySelector("body");
const titleEl = document.querySelector("#inputTitle");
const nameEl = document.querySelector("input#inputName");
const submitEl = document.querySelector("input#inputSubmit");

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
	// create player
	player = new Player(Name, 0);

	socket = io.connect(socketAddr);

	socket.emit("addUser", player);  // add user to server
	socket.on("setUsers", (data) => {  // set user id and get all users
		ID = data.id;
		player.id = ID;
		users = data.users;
		users.push(player);
		
		console.log(player);
		console.log(users);
		
	});

}


window.setup = function() {

	// get user name
	nameEl.addEventListener("keydown", (e) => { if (e.key == "Enter") checkName(); });
	submitEl.addEventListener("click", checkName);

	//while (!Name) {
	//	entry();
	//}

	
	
}



function draw() {
}

