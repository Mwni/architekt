import { Fragment } from '@architekt/render'
import { Element } from '../dom.js'

export default Fragment(
	({ text, action }, content) => {
		Element(
			'button', 
			{
				...props,
				class: 'a-button',
				onclick: action
			}, 
			text ? text : content
		)
	}
)