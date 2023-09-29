import * as PIXI from 'pixi.js'
// import {keyboard} from '../util/key'

// window.addEventListener('resize', () => resize(window.innerWidth, window.innerHeight))
// document.getElementById('root').append(APP.view)
// init()

export const APP = new PIXI.Application({
  antialias: true,
  width: window.innerWidth,
  height: window.innerHeight
})

export const STATE = {
  // keys: {
  //   space: keyboard(" "),
  // },
  uniforms: {
    time: 0.0,
    resolution: [APP.renderer.width, APP.renderer.height],
    mouse: [0, 0],
    alpha: 1.0,
    speed: [0.7, 0.4],
    shift: 1.6,
  },
}

function gameLoop(delta: number) {
  STATE.uniforms.time = performance.now() / 1000
  // const mousePosition = APP.renderer.plugins.interaction.mouse.getLocalPosition()
  // STATE.uniforms.mouse = [mousePosition.x, mousePosition.y]
}

export function resize(w, h) {
  APP.renderer.resize(w, h)
}

export function init() {
  PIXI.Assets
    .add('neon-balls', 'shaders/neon-balls.frag')
    .add('smoke', 'shaders/smoke.frag')
    .add('vert', 'shaders/vertex.vert')
    .load(() => {
      const w = APP.renderer.width
      const h = APP.renderer.height
      const geometry = new PIXI.Geometry()
      geometry.addAttribute('aVertexPosition', [
          0, 0,
          w, 0,
          0 , h,
          w,  h
        ], 2)
      geometry.addIndex([0, 1, 2, 2, 1, 3])
      geometry.interleave()

      const shader = PIXI.Shader.from(
        PIXI.Loader.shared.resources['vert'].data,
        PIXI.Loader.shared.resources['neon-balls'].data,
        STATE.uniforms)

      const mesh = new PIXI.Mesh(geometry, shader)
      APP.stage.addChild(mesh)

      APP.ticker.add((delta) => gameLoop(delta))
    })
}
