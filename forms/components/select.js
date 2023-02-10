import { Fragment, Select } from '@architekt/ui'

export default Fragment(({ model, key, ...props }, content) => {
	return Select(
		{
			...props,
			value: model.get(key),
			onSelect: value => model.set(key, value)
		},
		content
	)
})