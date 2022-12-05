import { Fragment } from '@architekt/render'
import { Element } from '../dom.js'

export default Fragment((props, content) => {
	Element(
		'body', 
		{
			class: ['root', props.class]
		}, 
		content
	)
})