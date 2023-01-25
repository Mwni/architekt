import { Fragment } from '@architekt/render'
import { Element } from '../dom.js'

export default Fragment((props, content) => {
	Element(
		'div', 
		{
			...props,
			class: ['absolute', props.class]
		}, 
		content
	)
})