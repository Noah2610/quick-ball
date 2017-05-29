
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

		this.collision();

	};

	this.collision = function() {
		
		// check for ball collision
		// collision with ring
		const collideBallRing = balls.some((ball) => {
			return collide({ x:this.x,y:this.y, vertices: this.ringVertices }, ball)
		});

		// collision with body
		const collideBall = balls.some((ball) => {
			return collide(this, ball)
		});

		if (collideBall) console.log(this.name + " Body collision with ball!");
		else if (collideBallRing) console.log(this.name + " Ring collision with ball!");

	};

	this.action = function () {
		this.actionActive = true;
		this.ringInnerColor = [255,0,0,64];  // visual feedback
		// reset:
		setTimeout(() => {
			this.actionActive = false;
			this.ringInnerColor = settings.ringInnerColor;
		}, Math.round(settings.actionCooldown / 4));
	};
}
