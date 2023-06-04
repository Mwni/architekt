import { Component } from '@architekt/render'
import { createTween } from './tween.js'


export default Component(({ ctx, ...tweens }) => {
	if(ctx.isClient){
		if(tweens.in){
			ctx.afterRender(() => {
				let [ element ] = ctx.dom
				let tween = createTween({
					...tweens.in,
					element
				})

				ctx.node.tweenIn = tween

				tween.on('complete', () => {
					ctx.node.tweenIn = undefined
				})
			})


		}
	}

	return (props, content) => {
		content()
	}
})