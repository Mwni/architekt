import { Fragment } from '@architekt/render'
import Element from '../element.js'

export default Fragment(({ text, ...props }) => Element(
		{
			...props,
			tag: 'span',
			class: ['a-text', props.class],
			textContent: text
		}
	)
)