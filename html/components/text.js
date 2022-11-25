import { Fragment } from '@architekt/render'
import { Element } from '../dom.js'

export default Fragment(({ text, ...props }) => {
	Element(
		'span', 
		{
			class: ['text', props.class]
		}, 
		text
	)
})