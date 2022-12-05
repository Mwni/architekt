import { findParentElement, awaitAsyncNodes } from '@architekt/render'
import { getContext, Component } from '@architekt/ui'
import { createRoute, createRouter } from './routing.js'

export default Component(({}) => {
	let { node, downstream, redraw, afterDraw } = getContext()
	let router = createRouter({
		window: findParentElement(node).ownerDocument.defaultView,
		redraw,
	})

	downstream.route = createRoute({
		path: '/',
		router
	})

	return ({}, content) => {
		router.startResolve()
		content()
		afterDraw(
			() => awaitAsyncNodes(node, router.endResolve)
		)
	}
})