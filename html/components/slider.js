import { Fragment } from '@architekt/render'
import Element from '../element.js'

export default Fragment(({ value, onInput, onChange, ...props }) => {
	return Element(
		{
			tag: 'input',
			type: 'range',
			...props,
			class: ['a-slider', props.class],
			value,
			oninput: onInput,
			onchange: onChange
		}
	)
})