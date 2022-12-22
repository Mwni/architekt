import { Fragment } from '@architekt/render'
import { Element } from '../dom.js'

export default Fragment(({ tapAction, ...props }, content) => {
	Element(
		'a', 
		{
			...props,
			class: ['interactive', props.class],
			onclick: tapAction
		}, 
		content
	)
})