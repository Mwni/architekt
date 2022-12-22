import { Fragment } from '@architekt/render'
import { Element } from '../dom.js'

export default Fragment(({ text, tier, ...props }) => {
	Element(
		`h${tier || 1}`, 
		{
			...props,
			class: ['headline', props.class]
		}, 
		text
	)
})