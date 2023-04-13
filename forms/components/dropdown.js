import { Fragment, Dropdown } from '@architekt/ui'

export default Fragment(({ model, key, disabled, ...props }) => {
	return Dropdown({
		...props,
		value: model.get(key),
		onChange: event => model.set(key, event.target.value),
		invalid: !!model.fieldStatus[key]?.invalid,
		disabled: model.submitting || disabled
	})
})