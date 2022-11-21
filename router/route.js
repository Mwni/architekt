import { getContext, Component } from '@architekt/ui'
import { createRoute } from './routing.js'


export default Component(({ route, fallback, bad }) => {
	let { route: parentNode, downstream } = getContext()
	let routeNode = createRoute({ route, parentNode })

	downstream.route = routeNode

	return (props, content) => {
		if(routeNode.view())
			content()
	}
})