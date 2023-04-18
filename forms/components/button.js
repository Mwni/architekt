import { Fragment, Button } from '@architekt/ui'

export default Fragment(({ ctx, model, classBusy, ...props }) => {
	model = model || ctx.upstream.model
	
	Button({
		...props,
		type: 'button',
		class: (model.submitting && classBusy) || props.class,
		disabled: !model.isEagerValid || model.submitting,
	})
})