import { ctx, render } from '@architekt/render'


export function getContext(){
	let scope = { ...ctx }

	return {
		downstream: scope.downstream,
		upstream: scope.upstream,
		redraw: () => {
			render(scope, scope.node)
		}
	}
}