import { ctx } from './context.js'

export default render => {
	let childPatch

	return (props, content) => {
		if(!props){
			props = {}
		}else if(typeof props === 'function' && !content){
			content = props
			props = {}
		}

		if(ctx.node.childPatch){
			childPatch = ctx.node.childPatch;

			[render, props, content] = childPatch(render, props, content)

			ctx.node.childPatch = undefined
		}

		render(props, content)

		if(childPatch)
			ctx.node.childPatch = childPatch
	}
}