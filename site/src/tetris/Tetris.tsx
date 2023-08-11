import { useEffect } from 'react'
import GAME from './game'

export default function Tetris() {
  useEffect(() => {
    GAME.start()
  }, [])

  return <div className='tetris'>
    <canvas id="tetris" width="300" height="600"></canvas>
    <div id="score">0</div>
  </div>
}
