import { Component } from '@architekt/render'
import Element from '../element.js'


export default Component(({ ctx, controller }) => {
	let wrap
	let canvas

	function resize(){
		canvas.width = wrap.clientWidth * window.devicePixelRatio
		canvas.height = wrap.clientHeight * window.devicePixelRatio
		canvas.style.width = `${wrap.clientWidth}px`
		canvas.style.height = `${wrap.clientHeight}px`
		canvas.dispatchEvent(new Event('resize'))
	}

	if(ctx.isClient){
		ctx.afterRender(() => {
			wrap = ctx.dom[0]
			canvas = wrap.children[0]

			window.addEventListener('resize', resize)
			controller(canvas)

			ctx.afterDelete(() => {
				canvas.dispatchEvent(new Event('remove'))
			})
		})
	}

	return ({ controller: newController, ...props }) => {
		if(newController !== controller)
			return ctx.teardown()

		Element(
			{
				tag: 'div',
				class: 'a-canvas-wrap'
			},
			() => Element({
				tag: 'canvas',
				...props,
				class: ['a-canvas', props.class]
			})
		)

		if(ctx.isClient)
			ctx.afterRender(resize)
	}
})