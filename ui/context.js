import { ctx, render } from '@architekt/render'


export function getContext(){
	let scope = { ...ctx }

	return {
		...scope.downstream,
		node: scope.node,
		components: scope.components,
		downstream: scope.downstream,
		upstream: scope.upstream,
		redraw: () => {
			render(scope, scope.node)
		},
		afterDraw: callback => {
			registerCallback(scope.node, 'afterDraw', callback)
		},
		afterDomCreation: callback => {
			registerCallback(scope.node, 'afterDomCreation', callback)
		}
	}
}

function registerCallback(node, type, callback){
	if(!node.callbacks)
		node.callbacks = []

	node.callbacks.push({ type, callback })
}