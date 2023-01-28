import { Fragment } from '@architekt/render'
import { Element } from '../dom.js'

export default Fragment(({ onTap, ...props }, content) => {
	Element(
		'a', 
		{
			...props,
			class: ['interactive', props.class],
			onclick: onTap
		}, 
		content
	)
})