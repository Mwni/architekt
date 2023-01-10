import { Fragment } from '@architekt/render'
import { Element } from '../dom.js'

export default Fragment(
	({ text, action, ...props }, content) => {
		Element(
			'button', 
			{
				...props,
				class: ['a-button', props.class],
				onclick: action
			}, 
			text ? text : content
		)
	}
)