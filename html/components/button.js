import { Fragment } from '@architekt/render'
import { Element } from '../dom.js'

export default Fragment(
	({ text, action }, content) => {
		Element(
			'button', 
			{
				class: 'a-button',
				onclick: action
			}, 
			text ? text : content
		)
	}
)