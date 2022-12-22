import { ctx } from './context.js'

export default render => {
	return (props, content) => {
		if(!props){
			props = {}
		}else if(typeof props === 'function' && !content){
			content = props
			props = {}
		}

		let renderFunc = render
		let childPatch

		if(ctx.node.childPatch){
			childPatch = ctx.node.childPatch
			ctx.node.childPatch = undefined

			;[renderFunc, props, content] = childPatch(renderFunc, props, content)
		}

		renderFunc(props, content)

		if(childPatch)
			ctx.node.childPatch = childPatch
	}
}