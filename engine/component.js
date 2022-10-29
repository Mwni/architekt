import { ctx } from './context.js'

export default (factory, meta) => {

	return (props, content) => {
		if(!props){
			props = {}
		}else if(typeof props === 'function' && !content){
			content = props
			props = {}
		}

		ctx.stack.push({
			meta,
			factory,
			props,
			content
		})
	}
}