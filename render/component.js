import { ctx } from './context.js'


export default construct => {
	let component = (props, content) => {
		if(typeof props === 'function'){
			content = props
			props = {}
		}

		let node = {
			component,
			props,
			content
		}

		ctx.stack.push(node)

		return node
	}

	return Object.assign(component, { construct })
}