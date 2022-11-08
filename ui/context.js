import { ctx, render } from '../render.js'


export function getContext(){
	let scope = { ...ctx }

	return {
		redraw: () => {
			render(scope, scope.node.component, scope.node.props)
		}
	}
}