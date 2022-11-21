import { findParentElement } from '@architekt/render'
import { getContext, Component } from '@architekt/ui'
import { createRoute, createRouter } from './routing.js'

export default Component(({}) => {
	let { redraw, node, downstream } = getContext()

	downstream.route = createRoute({
		route: '/',
		router: createRouter({
			window: findParentElement(node).ownerDocument.defaultView,
			redraw,
		})
	})

	return ({}, content) => content()
})