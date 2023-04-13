import { Fragment, Slider } from '@architekt/ui'

export default Fragment(({ model, key, disabled, ...props }) => {
	Slider({
		...props,
		value: model.get(key),
		onInput: event => model.set(key, event.target.value),
		disabled: model.submitting || disabled
	})
})