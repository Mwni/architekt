import { Fragment, Dropdown } from '@architekt/ui'

export default Fragment(({ ctx, model, key, disabled, ...props }) => {
	model = model || ctx.upstream.model

	return Dropdown({
		...props,
		value: model.get(key),
		onChange: event => model.set(key, event.target.value),
		invalid: model.fieldStatus[key]?.valid === false,
		disabled: model.submitting || disabled
	})
})