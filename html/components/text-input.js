import { Component } from '@architekt/render'
import Element from '../element.js'

export default Component(({ ctx, autoFocus }) => {
	if(autoFocus){
		ctx.afterRender(() => {
			ctx.dom[0].focus()
		})
	}

	return ({ text, multiline, secure, maxLength, onKeyDown, onInput, onChange, ...props }) => {
		if(multiline){
			return Element(
				{
					tag: 'textarea',
					...props,
					class: ['a-textinput', 'multiline', props.class],
					value: text,
					maxlength: maxLength,
					onkeydown: onKeyDown ? e => (onKeyDown(e), true) : undefined,
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
					maxlength: maxLength,
					onkeydown: onKeyDown ? e => (onKeyDown(e), true) : undefined,
					oninput: onInput,
					onchange: onChange
				}
			)
		}
	}
})