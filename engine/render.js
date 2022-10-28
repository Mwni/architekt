

export function create({ components, component, props }){
	let ctx = {
		components
	}

	render(ctx, [
		component(props)
	])
}

function render(ctx, nodes, previousNodes, nextSibling){
	createNodes(ctx, nodes, nextSibling)
}

function createNodes(ctx, nodes, nextSibling){
	for(let node of nodes){
		if(!node)
			continue

		createNode(ctx, node, nextSibling)
	}
}

function createNode(ctx, node, nextSibling){
	if(node.constructor){
		//do specific construction
	}

	if(node.children){
		createNodes(ctx, node.children, null)
	}
}

function createComponent(ctx, node, nextSibling){
	
}