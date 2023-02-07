import { Fragment } from '@architekt/render'
import { Element } from '../dom.js'

export default Fragment((props, content) => {
	Element(
		'body', 
		{
			...props,
			class: ['a-root', props.class]
		}, 
		content
	)
})