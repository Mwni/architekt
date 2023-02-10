import { findFirstElement, walkNodes } from '@architekt/render'
import { getContext, Component } from '@architekt/ui'
import Link from './link.js'

export default Component(() => {
	let { node, route, afterDraw } = getContext()

	return (props, content) => {
		content()

		afterDraw(() => {
			walkNodes(node, node => {
				if(node.construct !== Link.construct)
					return

				let element = findFirstElement(node)

				if(!element)
					return

				let path = node.props.path === '/'
					? '/'
					: `${node.props.path}/*`

				if(route.match({ path }))
					element.setAttribute('active', 'active')
				else
					element.removeAttribute('active')
			})
		})
	}
})