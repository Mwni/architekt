import { Fragment } from '@architekt/render'
import { Element } from '../dom.js'

export default Fragment(
	({ text, onTap, ...props }, content) => {
		Element(
			'button', 
			{
				...props,
				class: ['a-button', props.class],
				onclick: onTap
			}, 
			text ? text : content
		)
	}
)