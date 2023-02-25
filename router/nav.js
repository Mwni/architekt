import { findFirstElement, walkNodes } from '@architekt/render'
import { getContext, Component } from '@architekt/ui'
import Link from './link.js'

export default Component(() => {
	let { route } = getContext()

	return (props, content) => content().map(
		node => {
			if(node.component === Link){
				let path = node.props.path === '/'
					? '/'
					: `${node.props.path}/*`

				if(route.match({ path }))
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