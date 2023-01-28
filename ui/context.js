import { ctx, render } from '@architekt/render'


export function getContext(){
	let scope = { ...ctx }

	return {
		...scope.downstream,
		node: scope.node,
		components: scope.components,
		downstream: scope.downstream,
		upstream: scope.upstream,
		redraw: ({ all } = {}) => {
			let node = scope.node
			let renderScope = scope

			if(all){
				while(node.parentNode)
					node = node.parentNode

				node = node.children[0]
				renderScope = {
					...scope,
					node,
					downstream: node.downstream
				}
			}

			render(renderScope, node)
		},
		afterDraw: callback => {
			registerCallback(scope.node, 'afterDraw', callback)
		},
		afterDomCreation: callback => {
			registerCallback(scope.node, 'afterDomCreation', callback)
		},
		teardown: () => {
			scope.node.teardown = true
		}
	}
}

function registerCallback(node, type, callback){
	if(!node.callbacks)
		node.callbacks = []

	node.callbacks.push({ type, callback })
}