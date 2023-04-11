import { Component } from '@architekt/ui'
import Link from './link.js'

export default Component(({ ctx }) => {
	return (props, content) => content().map(
		node => {
			if(node.component === Link){
				let path = node.props.path === '/'
					? '/'
					: `${node.props.path}/*`

				if(ctx.upstream.route.match({ path }))
					return {
						...node,
						props: {
							...node.props,
							active: true
						}
					}
			}

			return node
		}
	)
})