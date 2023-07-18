var GAME = {};

GAME.start = function() {
	var canvas = document.getElementById("myCanvas");
	GAME.size = {"x" : canvas.width, "y" : canvas.height};
	GAME.ctx = canvas.getContext("2d");
	document.onkeydown = GAME.keyDown;
	GAME.meter = new FPSMeter(document.getElementById('fps'));
	GAME.lastTick = performance.now();
	GAME.lastRender = GAME.lastTick;
	GAME.tickLength = 50;
	GAME.board = new Board();
	GAME.board.init();
	GAME.end = false;
	GAME.frame(performance.now());
}

GAME.keyDown = function(e) {
	if(e.keyCode==37)
		GAME.board.move(1);
	if(e.keyCode==38)
		GAME.board.rotate();
	if(e.keyCode==39)
		GAME.board.move(2);
	if(e.keyCode==40)
		GAME.board.move(0);
}

GAME.frame= function(tFrame) {
	GAME.meter.tickStart();
	if(!GAME.end)
		requestAnimationFrame(GAME.frame);
	var nextTick = GAME.lastTick + GAME.tickLength;
	var numTicks = 0;

	if (tFrame > nextTick) {
	  var timeSinceTick = tFrame - GAME.lastTick;
	  numTicks = Math.floor( timeSinceTick / GAME.tickLength );
	}

	GAME.queueUpdates( numTicks );
	GAME.render( tFrame );
	GAME.lastRender = tFrame;
	GAME.meter.tick();
}

GAME.render = function(tFrame) {
	GAME.ctx.fillStyle = "#FFFFFF";
	GAME.ctx.fillRect(0, 0, GAME.size.x, GAME.size.y);
	GAME.board.render(GAME.ctx, GAME.size);
}

GAME.queueUpdates = function( numTicks ) {
	for(var i=0; i < numTicks; i++) {
	  GAME.lastTick = GAME.lastTick + GAME.tickLength; //Now lastTick is this tick.
	  GAME.update(GAME.lastTick);
	}
}

GAME.update = function(lastTick) {
	GAME.board.update();
}

function Board() {
	this.random = new Random();
	MV_DOWN = 0;
	MV_LEFT = 1;
	MV_RIGHT = 2;
	MINIMAL_SPEED = 13;
	MAXIMAL_SPEED = 4;
	this.size = {"x" : 10, "y" : 20};
	this.cells = [];
	this.figure = [];
	this.score = 0;
	this.speed = MINIMAL_SPEED;
	this.ticksLeft = this.speed;

	this.init = function() {
		this.newFigure();
	}

	this.update = function() {
		this.ticksLeft-=1;
		if(this.ticksLeft==0) {
			this.move(MV_DOWN);
			this.ticksLeft = this.speed;
		}
	}

	this.newFigure = function() {
		var k = Math.floor(this.random.next()*100)%7;
		this.figure = [];
		var pos = [];
		for(var i = 0; i<2; i++)
			for(var j=0; j<4; j++)
				if(FIGURES[k][i*4+j]==1)
					pos.push({"x": 3+j, "y": i});
		if(!this.validPos(pos))
			GAME.end = true;
		//var color = '#' + (function co(lor){   return (lor +=
		//           [0,1,2,3,4,5,6,7,8,9,'a','b','c','d','e','f'][Math.floor(Math.random()*16)])
		//           && (lor.length == 6) ?  lor : co(lor); })('');
		var color = COLORS[k];
		for(var i in pos)
			this.figure.push(new Cell(pos[i].x, pos[i].y, color));
	}

	this.move = function(direction) {
		var shift = {};
		shift.y = (direction==MV_DOWN)?1:0;
		shift.x = (direction==MV_DOWN)?0:((direction==MV_LEFT)?-1:1);
		var newPos = [];
		for(var i in this.figure)
			newPos[i] = {"x": this.figure[i].pos.x+shift.x, "y": this.figure[i].pos.y+shift.y};
		if(this.validPos(newPos)) {
			for(var i in this.figure)
				this.figure[i].pos=newPos[i];
		} else if(direction==MV_DOWN) {
			this.setFigure();
		}
	}

	this.validPos = function(pos) {
		for(var i in pos) {
			if(pos[i].x<0 || pos[i].y<0 || pos[i].x>=this.size.x || pos[i].y>=this.size.y)
				return false;
			if(this.cells[pos[i].y*this.size.x + pos[i].x]!==undefined)
				return false;
		}
		return true;
	}

	this.rotate = function() {
		var box = {"min": {"x": this.size.x, "y": this.size.y}, "max": {"x": 0, "y": 0}};
		for(var i in this.figure) {
			var pos = this.figure[i].pos;
			if(pos.x<box.min.x)
				box.min.x = pos.x;
			if(pos.x>box.max.x)
				box.max.x = pos.x;
			if(pos.y<box.min.y)
				box.min.y = pos.y;
			if(pos.y>box.max.y)
				box.max.y = pos.y;
		}
		var newPos = [];
		var dx = box.max.x - box.min.x;
		var dy = box.max.y - box.min.y;
		var corner = {"x": box.min.x + Math.sign(dx-dy)*Math.floor(Math.abs((dx-dy)/2)),"y": box.min.y + Math.sign(dy-dx)*Math.floor(Math.abs((dy-dx)/2))};
		for(var i in this.figure) {
			var pos = this.figure[i].pos;
			newPos[i] = {"x": corner.x + box.max.y - pos.y, "y": corner.y + pos.x - box.min.x};
		}
		if(this.validPos(newPos)) {
			for(var i in this.figure)
				this.figure[i].pos=newPos[i];
		}
	}

	this.setFigure = function() {
		for(var i in this.figure) {
			var cell = this.figure[i];
			this.cells[cell.pos.y*this.size.x + cell.pos.x] = new Cell(cell.pos.x, cell.pos.y, cell.color);
		}
		var lines = this.checkLines();
		this.updateScore(lines*10);
	}

	this.updateScore = function(pts) {
		this.score+=pts;
		this.speed = MINIMAL_SPEED-Math.floor(this.score/100);
		if(this.speed<MAXIMAL_SPEED)
			this.speed = MAXIMAL_SPEED;
		$("#score").text('Level: '+(MINIMAL_SPEED-this.speed+1)+'\tPts: '+this.score);
	}

	this.checkLines = function() {
		var linesCount = 0;
		while(true) {
			var line = -1;
			for(var i = 0; i<this.size.y; i++) {
				line=i;
				for(var j = 0; j<this.size.x; j++)
					if(this.cells[i*this.size.x+j]===undefined)
						line = -1;
				if(line==i)
					break;
			}
			if(line==-1)
				break;
			linesCount++;
			for(var i=line; i>0; i--)
				for(var j=0; j<this.size.x; j++) {
					this.cells[i*this.size.x+j] = this.cells[(i-1)*this.size.x+j];
					if(this.cells[i*this.size.x+j]!==undefined)
						this.cells[i*this.size.x+j].pos.y+=1;
				}
			for(var j=0; j<this.size.x; j++)
				this.cells[j]=undefined;
		}
		this.newFigure();
		return linesCount;
	}

	this.render = function(ctx, screen) {
		var sizeX = screen.x/this.size.x;
		var sizeY = screen.y/(this.size.y);
		var renderCell = function(cell) {
			if(cell!==undefined) {
				ctx.fillStyle = cell.color;
				ctx.fillRect(cell.pos.x*sizeX+1, cell.pos.y*sizeY+1 ,sizeX-2, sizeY-2);
			}
		}

		ctx.strokeStyle = "#010101";
		ctx.lineWidth = 0.2;
		for(var i=1; i<this.size.x; i++) {
			ctx.beginPath();
			ctx.moveTo(i*sizeX-1, 0);
			ctx.lineTo(i*sizeX-1, screen.y);
			ctx.stroke();
		}
		for(var i=1; i<this.size.y; i++) {
			ctx.beginPath();
			ctx.moveTo(0, i*sizeY-1);
			ctx.lineTo(screen.y, i*sizeY-1);
			ctx.stroke();
		}

		for(var i in this.cells)
			renderCell(this.cells[i]);
		for(var i in this.figure)
			renderCell(this.figure[i]);
	}
}

var FIGURES = [];
FIGURES[0] =  [0, 1, 1, 0, 0, 1, 1, 0]; //O
FIGURES[1] =  [1, 1, 1, 0, 0, 1, 0, 0]; //T
FIGURES[2] =  [1, 1, 1, 1, 0, 0, 0, 0]; //I
FIGURES[3] =  [0, 1, 1, 0, 1, 1, 0, 0]; //S
FIGURES[4] =  [1, 1, 0, 0, 0, 1, 1, 0]; //Z
FIGURES[5] =  [1, 1, 1, 0, 1, 0, 0, 0]; //L
FIGURES[6] =  [1, 1, 1, 0, 0, 0, 1, 0]; //Г

var COLORS = ["rgb(243, 156, 18)", "rgb(44, 154, 183)", "#CC3B3F", "#424A9C", "#78C946", "#818181", "#925396"];

function Cell(x, y, color) {
	this.pos = {"x": x, "y": y};
	this.color = color;
}

function Random(seed) {
	this.seed = seed;
	if(this.seed===undefined)
		this.seed = Math.floor(performance.now());

	this.generate = function(seed) {
		var num = Math.abs(Math.sin(this.seed));
		return num - Math.floor(num);
	}

	this.next = function() {
		var result = this.generate();
		this.seed += 1;
		return result;
	}
}
