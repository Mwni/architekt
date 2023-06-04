import { Component } from '@architekt/render'
import { createTween } from './tween.js'
import { createPhantom, createSnapshot } from './phantom.js'


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

			if(tweens.out){
				ctx.beforeDelete(() => {
					let [ element ] = ctx.dom
					let snapshot = createSnapshot({ element })

					ctx.afterDelete(() => {
						let phantom = createPhantom({
							element,
							snapshot
						})
					})
				})
			}
		}
	}

	return (props, content) => {
		content()
	}
})