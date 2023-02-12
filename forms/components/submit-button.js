import { Fragment, Button } from '@architekt/ui'

export default Fragment(({ model, busyClass, ...props }) => {
	Button({
		...props,
		class: (model.submitting && busyClass) || props.class,
		disabled: !model.canSubmit || model.submitting,
	})
})