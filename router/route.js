import { ctx } from '@architekt/render'
import { Fragment, Component } from '@architekt/ui'


export default Fragment(({ path, fallback, bad }, content) => {
	let route = ctx.downstream.route.maybeEnter({ path, fallback, bad })

	if(route){
		Holder({ route }, content)
	}
})

const Holder = Component(() => {
	return ({ route }, content) => {
		ctx.downstream.route = route
		content()
	}
})