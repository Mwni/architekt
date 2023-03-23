import { ctx } from '@architekt/render'
import { Fragment } from '@architekt/ui'

export default ({ path, fallback, bad }, content) => {
	let route = ctx.downstream.route.maybeEnter({ path, fallback, bad })

	if(route){
		Holder({ route }, content)
	}
}

const Holder = Fragment(({ route }, content) => {
	let prevRoute = ctx.downstream.route = route
	let nodes = content(route.params)

	ctx.downstream.route = prevRoute

	for(let node of nodes){
		node.downstream = {
			...node.downstream,
			route
		}
	}
})