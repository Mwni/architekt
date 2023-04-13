import { Component } from '@architekt/render'
import Element from '../element.js'
import Root from './root.js'

export default Component(({ ctx, direction, ...props }, content) => {
	let isRootScroller = true//ctx.parent.node.component === Root
	let scrollElement = isRootScroller
		? ctx.runtime.document.defaultView
		: undefined

	ctx.afterRender(() => {
		if(!isRootScroller)
			scrollElement = ctx.dom[0]

		scrollElement.addEventListener('scroll', handleScroll)
	})

	ctx.afterDelete(() => {
		scrollElement.removeEventListener('scroll', handleScroll)
	})
	
	function handleScroll(evt){
		if(isRootScroller){
			ctx.state.scrollX = evt.target.body.scrollLeft
			ctx.state.scrollY = evt.target.body.scrollTop
		}else{
			ctx.state.scrollX = scrollElement.scrollLeft
			ctx.state.scrollY = scrollElement.scrollTop
		}
	}

	return () => {
		let [ contentNode ] = content()

		if(isRootScroller)
			return [ contentNode ]
		else
			return [
				Element(
					{
						...props,
						tag: 'div',
						class: [`a-${direction}scroll`, props.class]
					}, 
					[contentNode]
				)
			]
	}
})