import { Fragment } from '@architekt/render'
import { Element } from '../dom.js'

export default Fragment((props, content) => {
	Element(
		'div', 
		{
			class: ['h-stack', props.class]
		}, 
		content
	)
})