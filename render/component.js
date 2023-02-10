import { ctx } from './context.js'
import Fragment from './fragment.js'

export default construct => {
	let component = Fragment(
		(props, content) => ctx.stack.push({
			component,
			construct,
			props,
			content
		})
	)

	component.construct = construct

	return component
}