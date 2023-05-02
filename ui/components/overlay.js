import { Component } from '@architekt/render'

export default Component(({ ctx }, content) => {
	ctx.afterRender(() => {
		ctx.afterDelete(
			ctx.createOverlay(content).close
		)
	})

	return () => {}
})