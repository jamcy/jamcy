import './index.css'
import * as serviceWorker from './serviceWorker'
import { init, resize, APP } from './game/game'

window.addEventListener('resize', () => resize(window.innerWidth, window.innerHeight))
document.getElementById('root').append(APP.view)
init()

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister()
