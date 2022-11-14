import { ctx } from './context.js'

export default construct => {
	let component = (props, content) => {
		if(!props){
			props = {}
		}else if(typeof props === 'function' && !content){
			content = props
			props = {}
		}

		ctx.stack.push({
			construct,
			props,
			content
		})
	}

	component.construct = construct

	return component
}