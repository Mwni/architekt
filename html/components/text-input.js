import { Fragment } from '@architekt/render'
import Element from '../element.js'

export default Fragment(({ text, multiline, onInput, onChange, ...props }) => {
	if(multiline){
		return Element(
			{
				tag: 'textarea',
				...props,
				class: ['a-textinput', 'multiline', props.class],
				value: text,
				oninput: onInput,
				onchange: onChange
			}
		)
	}else{
		return Element(
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
	}
})