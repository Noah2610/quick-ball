
export { _player };

function _player(name, id, x=Math.round(settings.canvasWidth / 2),y=Math.round(settings.canvasHeight / 2), color=settings.playerColor, size=settings.playerSize, ringSize=settings.ringSize) {
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


	this.show = function () {
		// draw ring
		stroke(settings.ringColor);
		strokeWeight(settings.ringWidth);
		fill(this.ringInnerColor);
		ellipse(this.x,this.y, this.ringSize);
		// draw body
		noStroke();
		fill(this.color);
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
		balls.forEach((ball,i) => {
			//return collide(this, ball);
			const obj = { part: "body", ball: i };
			const collisionExists = this.inCollision.some((x) => { return JSON.stringify(x) == JSON.stringify(obj); });
			const collision = collide({ x:this.x,y:this.y, vertices: this.vertices }, ball);
			bodyCollision = collision;
			if (!collisionExists && collision) {
				this.inCollision.push(obj);
			} else if (collisionExists && !collision) this.inCollision.splice(obj.ball ,1);
		});

		// collision with ring
		balls.forEach((ball,i) => {
			//return collide({ x:this.x,y:this.y, vertices: this.ringVertices }, ball);
			const obj = { part: "ring", ball: i };
			const collisionExists = this.inCollision.some((x) => { return JSON.stringify(x) == JSON.stringify(obj); });
			const collision = collide({ x:this.x,y:this.y, vertices: this.ringVertices }, ball);
			if (!collisionExists && collision && !bodyCollision) {
				this.inCollision.push(obj);
			} else if ((collisionExists && !collision) || (collisionExists && bodyCollision)) this.inCollision.splice(obj.ball ,1);
		});


		//if (collideBall) this.inCollision = "body";
		//else if (collideBallRing) this.inCollision = "ring";
		//else this.inCollision = false;

	};

	this.action = function () {
		this.actionShow();  // visual feedback

		this.inCollision.forEach((x) => {
			if (x.part == "body") {
				//console.log(this.name + " is hit!");
			} else if (x.part == "ring") {
				//console.log(this.name + " collision with ring!");
				
				balls[x.ball].deflect(this.x,this.y);

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

}
