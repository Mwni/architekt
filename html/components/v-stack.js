import { Fragment } from '@architekt/render'
import Element from '../element.js'

export default Fragment((props, content) => Element(
		{
			...props,
			tag: 'div',
			class: ['a-vstack', props.class]
		}, 
		content
	)
)