import { ctx, render } from '@architekt/engine'


export function getContext(){
	let scope = { ...ctx }

	return {
		redraw: () => {
			render(scope, scope.node.component, scope.node.props)
		}
	}
}