
export { _ball };

function _ball(delay=1000, mvDir=[1,0], x=Math.round(settings.canvasWidth / 2),y=Math.round(settings.canvasHeight / 2)) {
	this.delayed = true;
	setTimeout(() => { this.delayed = false; }, delay);
	this.mvDir = mvDir;
	this.x = x;
	this.y = y;

	this.move = function () {
		if (this.delayed) return;  // don't move if delay still active
	};

	this.show = function () {
		// draw ball
		
	};
}
