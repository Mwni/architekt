import { ctx, render, registerCallback } from '@architekt/render'


export function getContext(){
	let scope = { ...ctx }

	return {
		...scope.downstream,
		node: scope.node,
		runtime: scope.runtime,
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
		afterRemove: callback => {
			registerCallback(scope.node, 'afterRemove', callback)
		},
		teardown: () => {
			scope.node.teardown = true
		}
	}
}