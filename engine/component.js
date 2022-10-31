import { ctx } from './context.js'

export default factory => {
	let component = (props, content) => {
		if(!props){
			props = {}
		}else if(typeof props === 'function' && !content){
			content = props
			props = {}
		}

		ctx.stack.push({
			component,
			factory,
			props,
			content
		})
	}

	component.factory = factory

	return component
}