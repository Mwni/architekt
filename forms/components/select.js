import { Fragment, Select } from '@architekt/ui'

export default Fragment(({ model, key }, content) => {
	return Select(
		{
			value: model.get(key),
			onSelect: value => model.set(key, value)
		},
		content
	)
})