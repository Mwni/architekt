import { Fragment, Select } from '@architekt/ui'

export default Fragment(({ model, key, disabled, ...props }, content) => {
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