import { Fragment, Button } from '@architekt/ui'

	model = model || ctx.upstream.model
	
	Button({
		...props,
		class: (model.submitting && busyClass) || props.class,
		disabled: !model.isEagerValid || model.submitting,
	})
})