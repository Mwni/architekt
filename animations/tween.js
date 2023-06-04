import { createEmitter } from '@mwni/events'
import { applyTransform } from './dom.js'

let tweens = []
let ticking = false

export function createTween({ element, from, to, duration, curve }){
	let tween = {
		...createEmitter(),
		element,
		from,
		to,
		duration,
		curve,
		startTime: performance.now()
	}

	tweens.push(tween)

	if(!ticking)
		tick()

	return tween
}

function updateTween(tween){
	let t = (performance.now() - tween.startTime) / tween.duration
	let p = tween.curve(t)
	let transform = interpolate(tween.from, tween.to, p)

	applyTransform(tween.element, transform)

	if(t >= 1){
		tween.complete = true
		tween.emit('complete')
	}
}

function interpolate(from, to, p){
	let result = {}

	for(let key of Object.keys(to)){
		result[key] = from[key] * (1 - p) + to[key] * p
	}

	return result
}

function tick(){
	for(let i=0; i<tweens.length; i++){
		updateTween(tweens[i])

		if(tweens[i].complete){
			tweens.splice(i, 1)
			i--
		}
	}

	if(tweens.length > 0){
		requestAnimationFrame(tick)
		ticking = true
	}else{
		ticking = false
	}
}