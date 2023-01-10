import { Fragment, TextInput } from '@architekt/ui'

export default Fragment(({ model, key, ...props }) => {
	TextInput({
		...props,
		text: model.get(key),
		onInput: event => model.set(key, event.target.value),
		invalid: !!model.status[key]?.invalid
	})
})