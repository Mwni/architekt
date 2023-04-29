import { Component, Form } from '@architekt/ui'

export default Component(({ ctx, model, ...props }) => {
	let redraw = ctx.redraw.bind(ctx)
	
	ctx.public({ model })
	ctx.afterDelete(() => model.off('update', redraw))

	model.on('update', redraw)

	return ({ model: newModel }, content) => {
		if(model !== newModel)
			return ctx.teardown()

		return [
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
	}
})