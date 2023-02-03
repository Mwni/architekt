import { Component } from '@architekt/render'
import { getContext } from '@architekt/ui'
import { Element } from '../dom.js'


export default Component(({ controller }) => {
	let { afterDomCreation, afterRemove, afterDraw, isServer, teardown } = getContext()
	let wrap
	let canvas

	function resize(){
		canvas.width = wrap.clientWidth * window.devicePixelRatio
		canvas.height = wrap.clientHeight * window.devicePixelRatio
		canvas.style.width = `${wrap.clientWidth}px`
		canvas.style.height = `${wrap.clientHeight}px`
		canvas.dispatchEvent(new Event('resize'))
	}

	if(!isServer){
		afterDomCreation(dom => {
			wrap = dom[0]
			canvas = wrap.children[0]

			window.addEventListener('resize', resize)
			controller(canvas)

			afterRemove(() => {
				canvas.dispatchEvent(new Event('remove'))
			})
		})
	}

	return ({ controller: newController, ...props }) => {
		if(newController !== controller)
			return teardown()

		Element(
			'div',
			{
				class: 'a-canvas-wrap'
			},
			() => Element(
				'canvas',
				{
					...props,
					class: ['a-canvas', props.class]
				}
			)
		)

		if(!isServer)
			afterDraw(resize)
	}
})