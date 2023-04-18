import { Fragment, Slider } from '@architekt/ui'

export default Fragment(({ ctx, model, key, disabled, ...props }) => {
	model = model || ctx.upstream.model
	
	Slider({
		...props,
		value: model.get(key),
		onInput: event => model.set(key, event.target.value),
		disabled: model.submitting || disabled
	})
})