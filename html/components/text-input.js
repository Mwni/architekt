import { Fragment } from '@architekt/render'
import Element from '../element.js'

export default Fragment(({ text, multiline, secure, onInput, onChange, ...props }) => {
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
				type: secure ? 'password' : 'text',
				...props,
				class: ['a-textinput', props.class],
				value: text,
				oninput: onInput,
				onchange: onChange
			}
		)
	}
})