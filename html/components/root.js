import { Fragment } from '@architekt/render'
import Element from '../element.js'

export default Fragment((props, content) => {
	Element(
		{
			...props,
			tag: 'body',
			class: ['a-root', props.class]
		}, 
		content
	)
})