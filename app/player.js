
export { _player };

function _player(name, id, x=Math.round(settings.canvasWidth / 2),y=Math.round(settings.canvasHeight / 2), color=settings.playerColor, size=settings.playerSize, ringSize=settings.ringSize, dead=false) {
	this.name = name;
	this.id = id;
	this.x = x;
	this.y = y;
	this.color = color;
	this.size = size;
	this.ringSize = ringSize;
	this.ringInnerColor = settings.ringInnerColor;
	this.actionActive = false;
	this.vertices = getVertices(this.x,this.y,this.size, settings.playerTotalVertices);
	this.ringVertices = getVertices(this.x,this.y,this.ringSize, settings.ringTotalVertices);
	this.inCollision = [];
	this.dead = dead;
	this.invul = false;


	this.show = function () {
		// draw ring
		stroke(settings.ringColor);
		strokeWeight(settings.ringWidth);
		fill(this.ringInnerColor);
		ellipse(this.x,this.y, this.ringSize);
		// draw body
		noStroke();
		if (this.invul) fill(this.color.concat(64));
		else if (!this.invul) fill(this.color.concat(255));
		ellipseMode(CENTER);
		ellipse(this.x,this.y, this.size);
		// draw name tag
		//stroke(0);
		//strokeWeight(2);
		fill(0);
		textAlign(CENTER,TOP);
		textSize(16);
		text(this.name, this.x, this.y + 8);

		//this.collision();

	};

	this.collision = function() {
		
		// check for ball collision
		let bodyCollision = false;
		// collision with body
		balls.forEach((ball) => {
			//return collide(this, ball);
			const obj = { part: "body", ball: ball };
			const collisionExists = this.inCollision.some((x) => { return JSON.stringify(x) == JSON.stringify(obj); });
			const collision = collide({ x:this.x,y:this.y, vertices: this.vertices }, ball);
			bodyCollision = collision;
			if (!collisionExists && collision) {
				this.inCollision.push(obj);
			} else if (collisionExists && !collision) this.inCollision.splice(obj.ball, 1);
		});

		// collision with ring
		balls.forEach((ball) => {
			//return collide({ x:this.x,y:this.y, vertices: this.ringVertices }, ball);
			const obj = { part: "ring", ball: ball };
			const collisionExists = this.inCollision.some((x) => { return JSON.stringify(x) == JSON.stringify(obj); });
			const collision = collide({ x:this.x,y:this.y, vertices: this.ringVertices }, ball);
			if (!collisionExists && collision && !bodyCollision) {
				this.inCollision.push(obj);
			} else if ((collisionExists && !collision) || (collisionExists && bodyCollision)) this.inCollision.splice(obj.ball, 1);
		});

		this.inCollision.forEach((x) => {
			if (x.part == "body") {
				if (!this.invul) {
					socket.emit("ballUpdate", x.ball);
					this.ringSize -= settings.playerRingDecr;
					this.ringVertices = getVertices(this.x,this.y,this.ringSize, settings.ringTotalVertices);
					if (this.ringSize <= this.size)
						this.die();
					else
						socket.emit("playerHit", { id: this.id, ringSize: this.ringSize });
						
						//socket.emit("playerDeath", this);
					this.invul = true;
					setTimeout(() => { this.invul = false; }, settings.invulTime);
				}
			}
		});

		//if (collideBall) this.inCollision = "body";
		//else if (collideBallRing) this.inCollision = "ring";
		//else this.inCollision = false;

	};

	this.action = function () {
		this.actionShow();  // visual feedback

		this.inCollision.forEach((x) => {
			if (x.part == "ring") {
				// deflect ball
				x.ball.deflect(this.x,this.y);
				socket.emit("ballUpdate", x.ball);
				// gain ring
				if (this.ringSize < settings.ringSize) {
					this.ringSize += settings.playerRingIncr;
					socket.emit("playerGain", { id: this.id, ringSize: this.ringSize });
				}

			}
		});

	};

	this.actionShow = function () {
		// for visual feedback
		this.actionActive = true;
		this.ringInnerColor = [255,0,0,64];
		// reset visual
		setTimeout(() => {
			this.actionActive = false;
			this.ringInnerColor = settings.ringInnerColor;
		}, Math.round(settings.actionCooldown / 4));
	};

	this.onScreen = function (dir) {
		switch (dir) {
			case "up":
				if (offScreen(this.x, this.y - settings.playerStep, this.vertices.map((v) => { return {x:v.x,y:v.y-settings.playerStep}; }))) return false;
				else return true;
				break;
			case "down":
				if (offScreen(this.x, this.y + settings.playerStep, this.vertices.map((v) => { return {x:v.x,y:v.y+settings.playerStep}; }))) return false;
				else return true;
				break;
			case "left":
				if (offScreen(this.x - settings.playerStep, this.y, this.vertices.map((v) => { return {x:v.x-settings.playerStep,y:v.y}; }))) return false;
				else return true;
				break;
			case "right":
				if (offScreen(this.x + settings.playerStep, this.y, this.vertices.map((v) => { return {x:v.x+settings.playerStep,y:v.y}; }))) return false;
				else return true;
				break;
		}
	};

	this.die = function () {
		this.dead = true;
		this.vertices = [];
		this.ringVertices = [];
		this.inCollision = [];
		socket.emit("playerDeath", Player.id);
	}

}
