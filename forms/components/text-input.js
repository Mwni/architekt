import { Fragment, TextInput } from '@architekt/ui'

export default Fragment(({ ctx, model, key, disabled, ...props }) => {
	model = model || ctx.upstream.model
	
	TextInput({
		...props,
		text: model.get(key),
		onInput: event => model.set(key, event.target.value),
		invalid: model.fieldStatus[key]?.valid === false,
		disabled: model.submitting || disabled
	})
})