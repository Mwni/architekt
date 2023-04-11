import { awaitAsyncNodes } from '@architekt/render'
import { Component } from '@architekt/ui'
import { createRoute, createRouter } from './routing.js'

export default Component(({ ctx }) => {
	let router = createRouter({
		window: ctx.runtime.document.defaultView,
		redraw: () => ctx.redraw(),
	})

	ctx.public({
		route: createRoute({
			path: '/',
			router
		})
	})

	return (props, content) => {
		router.startResolve()
		content()
		ctx.afterRender(
			() => awaitAsyncNodes(ctx.node, router.endResolve)
		)
	}
})