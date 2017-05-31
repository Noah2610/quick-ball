
export { _ball };

function _ball(id, delay=1000, mvDir=[1,0.5], x=10,y=10, spdMult=settings.ballSpdMult) {
	this.id = id;
	this.delayed = true;
	setTimeout(() => { this.delayed = false; }, delay);
	this.mvDir = mvDir;
	this.x = x;
	this.y = y;
	this.size = settings.ballSize;
	this.color = settings.ballColor;
	this.vertices = getVertices(this.x,this.y, this.size, settings.ballTotalVertices);
	this.spdMult = spdMult;
	this.spdIncr = settings.ballSpdIncr;

	this.deflect = function (x, y) {
		
		//const vector = { x: this.x - x, y: this.y - y };
		//const vectorDist = getDist({x:x,y:y}, vector);
		//this.mvDir = [ (vector.x * (10 / vectorDist)) * this.spdMult, (vector.y * (10 / vectorDist)) * this.spdMult ];
		//this.mvDir = [ vector.x * this.spdMult, vector.y * this.spdMult ];

		const angleDeg = Math.atan2(this.y - y, this.x - x) * 180 / Math.PI;
		const angleRad = Math.atan2(this.y - y, this.x - x);

		this.spdMult += this.spdIncr;
		//this.mvDir = [ this.x + (this.spdMult * Math.cos(angleRad)), this.y + (this.spdMult * Math.cos(angleRad)) ];
		this.mvDir = [ Math.round(Math.cos(angleRad) * this.spdMult), Math.round(Math.sin(angleRad) * this.spdMult) ];

	};

	this.getSpd = function () {
		console.log(getDist({ x: this.x - this.mvDir[0], y: this.y - this.mvDir[1] }, this));
	};

	this.move = function () {
		if (this.delayed) return;  // don't move if delay still active

		this.x += this.mvDir[0];
		this.y += this.mvDir[1];

		this.getVertices();

		// collision with canvas edges
		let sendBallData = false;
		this.vertices.forEach((v) => {
			// left
			if (v.x <= 0 && this.mvDir[0] < 0) {
				this.mvDir[0] *= -1;
				sendBallData = true;
			}
			// right
			if (v.x >= settings.canvasWidth && this.mvDir[0] > 0) {
				this.mvDir[0] *= -1;
				sendBallData = true;
			}
			// top
			if (v.y <= 0 && this.mvDir[1] < 0) {
				this.mvDir[1] *= -1;
				sendBallData = true;
			}
			// bottom
			if (v.y >= settings.canvasHeight && this.mvDir[1] > 0) {
				this.mvDir[1] *= -1;
				sendBallData = true;
			}
		});
		if (sendBallData) socket.emit("ballUpdate", this);
	};

	this.show = function () {
		// draw ball
		noStroke();
		fill(this.color);
		ellipseMode(CENTER);
		ellipse(this.x,this.y, this.size);

			// show graphical representation of spd (mvDir)
			//stroke(255,0,0);
			//line(settings.canvasWidth / 2, settings.canvasHeight / 2, settings.canvasWidth / 2 + this.mvDir[0] * 10, settings.canvasWidth / 2 + this.mvDir[1] * 10);

	};

	this.getVertices = function () {
		this.vertices = getVertices(this.x,this.y, this.size, settings.ballTotalVertices);
	};

}
