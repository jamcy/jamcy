import './tetris.css'
import { simpleSeeded } from '../util/random'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const GAME: any= {}

GAME.start = function() {
  const canvas = document.getElementById('tetris') as HTMLCanvasElement
  if (!canvas) throw new Error('No canvas')
  GAME.size = {
    x : canvas.getAttribute('width'),
    y : canvas.getAttribute('height')
  }
  GAME.ctx = canvas.getContext("2d")
  document.onkeydown = GAME.keyDown
  GAME.lastTick = performance.now()
  GAME.lastRender = GAME.lastTick
  GAME.tickLength = 50
  GAME.board = new Board()
  GAME.board.init()
  GAME.end = false
  GAME.frame(performance.now())
}

GAME.keyDown = function(e: KeyboardEvent) {
  e.preventDefault()
  switch (e.code) {
    case 'ArrowLeft':
    case 'KeyA':
      GAME.board.move(1)
      break
    case 'ArrowUp':
    case 'KeyW':
    case 'Space':
      GAME.board.rotate()
      break
    case 'ArrowRight':
    case 'KeyD':
      GAME.board.move(2)
      break
    case 'ArrowDown':
    case 'KeyS':
      GAME.board.move(0)
      break
  }
}

GAME.frame = function(tFrame: number) {
  if(!GAME.end)
    requestAnimationFrame(GAME.frame)
  const nextTick = GAME.lastTick + GAME.tickLength
  let numTicks = 0

  if (tFrame > nextTick) {
    const timeSinceTick = tFrame - GAME.lastTick
    numTicks = Math.floor( timeSinceTick / GAME.tickLength )
  }

  GAME.queueUpdates( numTicks )
  GAME.render( tFrame )
  GAME.lastRender = tFrame
}

GAME.render = function() {
  GAME.ctx.fillStyle = "#FFFFFF"
  GAME.ctx.fillRect(0, 0, GAME.size.x, GAME.size.y)
  GAME.board.render(GAME.ctx, GAME.size)
}

GAME.queueUpdates = function(numTicks: number) {
  for(let i=0; i < numTicks; i++) {
    GAME.lastTick = GAME.lastTick + GAME.tickLength; //Now lastTick is this tick.
    GAME.update(GAME.lastTick)
  }
}

GAME.update = function() {
  GAME.board.update()
}

class Board {
  random = simpleSeeded(performance.now())
  MV_DOWN = 0
  MV_LEFT = 1
  MV_RIGHT = 2
  MINIMAL_SPEED = 13
  MAXIMAL_SPEED = 4
  size = {"x" : 10, "y" : 20}
  cells: (Cell | undefined)[] = []
  figure: Cell[] = []
  score = 0
  speed = this.MINIMAL_SPEED
  ticksLeft = this.speed

  public init() {
    this.newFigure()
  }

  public update() {
    this.ticksLeft-=1
    if(this.ticksLeft==0) {
      this.move(this.MV_DOWN)
      this.ticksLeft = this.speed
    }
  }

  public newFigure() {
    const k = this.random() % 7
    this.figure = []
    const pos = []
    for(let i = 0; i<2; i++)
      for(let j=0; j<4; j++)
        if(FIGURES[k][i*4+j]==1)
          pos.push({"x": 3+j, "y": i})
    if(!this.validPos(pos))
      GAME.end = true
    //const color = '#' + (function co(lor){   return (lor +=
    //           [0,1,2,3,4,5,6,7,8,9,'a','b','c','d','e','f'][Math.floor(Math.random()*16)])
    //           && (lor.length == 6) ?  lor : co(lor); })('')
    const color = COLORS[k]
    for(const p of pos)
      this.figure.push(new Cell(p.x, p.y, color))
  }

  public move(direction: number) {
    const shift = {
      x: (direction === this.MV_DOWN)?0:((direction === this.MV_LEFT)?-1:1),
      y: (direction === this.MV_DOWN)?1:0
    }
    const newPos: { x: number, y: number }[] = []
    for(const i in this.figure)
      newPos[i] = { x: this.figure[i].pos.x+shift.x, y: this.figure[i].pos.y+shift.y }
    if(this.validPos(newPos)) {
      for(const i in this.figure)
        this.figure[i].pos=newPos[i]
    } else if(direction==this.MV_DOWN) {
      this.setFigure()
    }
  }

  public validPos(pos: {x: number, y: number}[]) {
    for(const i in pos) {
      if(pos[i].x<0 || pos[i].y<0 || pos[i].x>=this.size.x || pos[i].y>=this.size.y)
        return false
      if(this.cells[pos[i].y*this.size.x + pos[i].x]!==undefined)
        return false
    }
    return true
  }

  public rotate() {
    const box = {"min": {"x": this.size.x, "y": this.size.y}, "max": {"x": 0, "y": 0}}
    for(const i in this.figure) {
      const pos = this.figure[i].pos
      if(pos.x<box.min.x)
        box.min.x = pos.x
      if(pos.x>box.max.x)
        box.max.x = pos.x
      if(pos.y<box.min.y)
        box.min.y = pos.y
      if(pos.y>box.max.y)
        box.max.y = pos.y
    }
    const newPos: {x: number, y: number}[] = []
    const dx = box.max.x - box.min.x
    const dy = box.max.y - box.min.y
    const corner = {
      "x": box.min.x + Math.sign(dx-dy)*Math.floor(Math.abs((dx-dy)/2)),
      "y": box.min.y + Math.sign(dy-dx)*Math.floor(Math.abs((dy-dx)/2))
    }
    for(const i in this.figure) {
      const pos = this.figure[i].pos
      newPos[i] = {"x": corner.x + box.max.y - pos.y, "y": corner.y + pos.x - box.min.x}
    }
    if(this.validPos(newPos)) {
      for(const i in this.figure)
        this.figure[i].pos=newPos[i]
    }
  }

  public setFigure() {
    for(const i in this.figure) {
      const cell = this.figure[i]
      this.cells[cell.pos.y*this.size.x + cell.pos.x] = new Cell(cell.pos.x, cell.pos.y, cell.color)
    }
    const lines = this.checkLines()
    this.updateScore(lines*10)
  }

  public updateScore(pts: number) {
    this.score+=pts
    this.speed = this.MINIMAL_SPEED-Math.floor(this.score/100)
    if(this.speed<this.MAXIMAL_SPEED)
      this.speed = this.MAXIMAL_SPEED
    document.getElementById('score')!.textContent = 'Level: '+(this.MINIMAL_SPEED-this.speed+1)+'\tPts: '+this.score
  }

  public checkLines() {
    let linesCount = 0
    // eslint-disable-next-line no-constant-condition
    while(true) {
      let line = -1
      for(let i = 0; i<this.size.y; i++) {
        line=i
        for(let j = 0; j<this.size.x; j++)
          if(this.cells[i*this.size.x+j]===undefined)
            line = -1
        if(line==i)
          break
      }
      if(line==-1)
        break
      linesCount++
      for(let i=line; i>0; i--)
        for(let j=0; j<this.size.x; j++) {
          this.cells[i*this.size.x+j] = this.cells[(i-1)*this.size.x+j]
          if(this.cells[i*this.size.x+j]!==undefined)
            this.cells[i*this.size.x+j]!.pos.y += 1
        }
      for(let j=0; j<this.size.x; j++)
        this.cells[j]=undefined
    }
    this.newFigure()
    return linesCount
  }

  public render(ctx: CanvasRenderingContext2D, scrSize: {x: number, y: number}) {
    const sizeX = scrSize.x/this.size.x
    const sizeY = scrSize.y/(this.size.y)
    const renderCell = function(cell?: Cell) {
      if(cell!==undefined) {
        ctx.fillStyle = cell.color
        ctx.fillRect(cell.pos.x*sizeX+1, cell.pos.y*sizeY+1 ,sizeX-2, sizeY-2)
      }
    }

    ctx.strokeStyle = "#010101"
    ctx.lineWidth = 0.2
    for(let i=1; i<this.size.x; i++) {
      ctx.beginPath()
      ctx.moveTo(i*sizeX-1, 0)
      ctx.lineTo(i*sizeX-1, scrSize.y)
      ctx.stroke()
    }
    for(let i=1; i<this.size.y; i++) {
      ctx.beginPath()
      ctx.moveTo(0, i*sizeY-1)
      ctx.lineTo(scrSize.y, i*sizeY-1)
      ctx.stroke()
    }

    for (const i in this.cells)
      renderCell(this.cells[i]!)
    for (const i in this.figure)
      renderCell(this.figure[i])
  }
}

const FIGURES: number[][] = []
FIGURES[0] =  [0, 1, 1, 0, 0, 1, 1, 0]; //O
FIGURES[1] =  [1, 1, 1, 0, 0, 1, 0, 0]; //T
FIGURES[2] =  [1, 1, 1, 1, 0, 0, 0, 0]; //I
FIGURES[3] =  [0, 1, 1, 0, 1, 1, 0, 0]; //S
FIGURES[4] =  [1, 1, 0, 0, 0, 1, 1, 0]; //Z
FIGURES[5] =  [1, 1, 1, 0, 1, 0, 0, 0]; //L
FIGURES[6] =  [1, 1, 1, 0, 0, 0, 1, 0]; //Г

const COLORS = ["rgb(243, 156, 18)", "rgb(44, 154, 183)", "#CC3B3F", "#424A9C", "#78C946", "#818181", "#925396"]

class Cell {
  public pos: { x: number, y: number }
  public color: string
  constructor(x: number, y: number, color: string) {
    this.pos = { x, y }
    this.color = color
  }
}

export default GAME