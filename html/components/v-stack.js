import { Fragment } from '@architekt/render'
import { Element } from '../dom.js'

export default Fragment((props, content) => {
	Element(
		'div', 
		{
			...props,
			class: ['a-vstack', props.class]
		}, 
		content
	)
})