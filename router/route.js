import { Fragment, Component } from '@architekt/ui'

export default Fragment(({ ctx, path, fallback, bad }, content) => {
	let route = ctx.upstream.route.maybeEnter({ path, fallback, bad })

	if(route){
		Route({ route }, content)
	}
})

const Route = Component(({ ctx, route }, content) => {
	ctx.public({ route })

	if(content)
		content(route)
})