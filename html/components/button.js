import { Fragment } from '@architekt/render'
import Element from '../element.js'

export default Fragment(
	({ text, onTap, type, ...props }, content) => Element(
		{
			...props,
			tag: 'button',
			type: type || 'button',
			class: ['a-button', props.class],
			onclick: onTap,
			textContent: text
		},
		text ? undefined : content
	)
)