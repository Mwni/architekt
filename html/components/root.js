import { Component } from '@architekt/render'
import Element from '../element.js'

export default Component(({ ctx }) => {
	ctx.node.root = true
	
	return (props, content) => Element(
		{
			...props,
			tag: 'body',
			class: ['a-root', props.class]
		}, 
		content
	)
})