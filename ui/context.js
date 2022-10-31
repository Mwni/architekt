import { ctx, render } from '@architekt/engine'


export function getContext(){
	let scope = { ...ctx }

	return {
		redraw: () => {
			console.log('redraw', scope)
			render(scope, scope.node.component, scope.node.props)
		}
	}
}