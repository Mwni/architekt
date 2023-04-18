import { Component, Form } from '@architekt/ui'

export default Component(({ ctx, model, ...props }, content) => {
	let redraw = ctx.redraw.bind(ctx)
	
	ctx.public({ model })
	ctx.afterDelete(() => model.off('update', redraw))

	model.on('update', redraw)

	return () => [
		Form(
			{
				...props,
				onsubmit: evt => {
					evt.preventDefault()
					model.submit()
				}
			},
			content
		)
	]
})