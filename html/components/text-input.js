import { Fragment } from '@architekt/render'
import Element from '../element.js'

export default Fragment(({ text, onInput, onChange, ...props }) => {
	Element(
		{
			tag: 'input',
			type: 'text',
			...props,
			class: ['a-textinput', props.class],
			value: text,
			oninput: onInput,
			onchange: onChange
		}
	)
})