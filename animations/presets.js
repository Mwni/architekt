import { linear, outBack } from './curves.js'

export function popIn({ duration = 300, curve = outBack, ...other } = {}){
	return {
		...other,
		duration,
		curve,
		from: {
			scaleX: 0,
			scaleY: 0
		},
		to: {
			scaleX: 1,
			scaleY: 1
		}
	}
}

export function popOut({ duration = 200, curve = linear, ...other } = {}){
	return {
		...other,
		duration,
		curve,
		to: {
			scaleX: 0,
			scaleY: 0
		}
	}
}