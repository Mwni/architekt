import { Fragment, TextInput } from '@architekt/ui'

export default Fragment(({ model, key, disabled, ...props }) => {
	TextInput({
		...props,
		text: model.get(key),
		onInput: event => model.set(key, event.target.value),
		invalid: !!model.fieldStatus[key]?.invalid,
		disabled: model.submitting || disabled
	})
})