import { Fragment } from '@architekt/render'
import Element from '../element.js'


export default Fragment((props, content) => Element(
	{
		...props,
		tag: 'form',
		class: ['a-form', props.class]
	}, 
	content
))