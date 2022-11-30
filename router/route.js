import { ctx } from '@architekt/render'
import { Fragment, Component } from '@architekt/ui'


export default Fragment(({ route, fallback, bad }, content) => {
	let routeChild = ctx.downstream.route.maybeEnter({ route, fallback, bad })

	if(routeChild){
		Holder({ route: routeChild }, content)
	}
})

const Holder = Component(() => {
	return ({ route }, content) => {
		ctx.downstream.route = route
		content()
	}
})