import { ctx } from '@architekt/render'
import { Fragment } from '@architekt/ui'

export default ({ path, fallback, bad }, content) => {
	let route = ctx.downstream.route.maybeEnter({ path, fallback, bad })

	if(route){
		Holder({ route }, content)
	}
}

const Holder = Fragment(({ route }, content) => {
	ctx.downstream.route = route
	content(route.params)
})