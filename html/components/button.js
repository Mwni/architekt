import { Fragment } from '@architekt/render'
import Element from '../element.js'

export default Fragment(
	({ text, onTap, ...props }, content) => Element(
		{
			...props,
			tag: 'button',
			class: ['a-button', props.class],
			onclick: onTap,
			textContent: text
		},
		text ? undefined : content
	)
)