import { ctx } from './context.js'


export default view => {
	let fragment = (props, content) => {
		if(typeof props === 'function'){
			content = props
			props = {}
		}

		let node = {
			fragment,
			props,
			content
		}

		ctx.stack.push(node)

		return node
	}

	return Object.assign(fragment, { view })
}