import { Fragment } from '@architekt/render'
import { Element } from '../dom.js'

export default Fragment(({ text, onInput, onChange, ...props }) => {
	Element(
		'input', 
		{
			type: 'text',
			...props,
			class: ['text-input', props.class],
			value: text,
			oninput: onInput,
			onchange: onChange
		}
	)
})