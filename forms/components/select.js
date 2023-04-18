import { Fragment, Select } from '@architekt/ui'

export default Fragment(({ ctx, model, key, disabled, ...props }, content) => {
	model = model || ctx.upstream.model

	return Select(
		{
			...props,
			value: model.get(key),
			onSelect: value => model.set(key, value),
			disabled: model.submitting || disabled,
		},
		content
	)
})