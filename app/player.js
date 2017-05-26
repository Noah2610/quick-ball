
export { _player };

function _player(name, id, x=Math.round(settings.canvasWidth / 2),y=Math.round(settings.canvasHeight / 2), color=settings.playerColor, size=settings.playerSize) {
	this.name = name;
	this.id = id;
	this.x = x;
	this.y = y;
	this.color = color;
	this.size = size;


	this.show = function () {
		noStroke();
		fill(color);
		ellipseMode(CENTER);
		ellipse(this.x,this.y, this.size);
	}
}
