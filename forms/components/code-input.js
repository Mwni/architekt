import { Component, HStack, TextInput } from '@architekt/ui'

export default Component(({ ctx, model, key, digits }) => {
	model = model || ctx.upstream.model

	let inputs

	ctx.afterRender(() => {
		inputs = Array.from(ctx.dom[0].children)
		inputs[0].focus()
	})

	function handleInput(index){
		let code = inputs.reduce(
			(code, input) => code + input.value,
			''
		).slice(0, digits)

		model.set(key, code)

		if(code.length < digits)
			inputs[code.length].focus()
		else{
			inputs[index].blur()
			model.submit()
				.catch(error => {
					model.set(key, '', { retainErrors: true })
					inputs[0].focus()
					throw error
				})
		}
	}

	function handleBackspace(index){
		let code = model.get(key)
		let offset = code.charAt(index) === '' ? 1 : 0

		model.set(
			key, 
			code.slice(0, index - offset)
		)
		handleInput(index - offset)
	}

	return ({ classInputs, disabled, ...props }) => {
		let code = model.get(key)

		HStack({ class: props.class }, () => {
			for(let i=0; i<digits; i++){
				TextInput({
					class: classInputs,
					type: 'number',
					text: code.charAt(i),
					maxLength: 1,
					onInput: event => handleInput(i),
					onKeyDown: event => event.keyCode === 8 && handleBackspace(i),
					invalid: model.fieldStatus[key]?.valid === false,
					disabled: model.submitting || disabled || i > code.length
				})
			}
		})	
	}
})