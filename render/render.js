import { ctx } from './context.js'


export function render(scope, node){
	Object.assign(ctx, scope)

	updateNodes(
		scope.node ? [scope.node] : undefined, 
		[node]
	)

	Object.assign(ctx, { node })
}

function updateNodes(nodes, newNodes){
	if(newNodes === nodes || (!newNodes && !nodes))
		return

	if(!nodes || nodes.length === 0){
		createNodes(newNodes)
		return
	}

	if(!newNodes || newNodes.length === 0){
		removeNodes(nodes)
		return
	}

	let commonLength = Math.min(nodes.length, newNodes.length)

	for (let i=0; i<commonLength; i++){
		updateNode(nodes[i], newNodes[i])
	}

	if(nodes.length > commonLength){
		removeNodes(nodes.slice(commonLength))
		nodes.splice(commonLength)
	}

	if(newNodes.length > commonLength){
		let newNodesSlice = newNodes.slice(commonLength)

		createNodes(newNodesSlice)
		nodes.push(...newNodesSlice)
	}
}


function createNodes(nodes){
	for(let node of nodes){
		createNode(node)
	}
}

function createNode(node){
	if(node.construct){
		createComponent(node)
	}else if(node.element){
		createElement(node)
	}
}

function createComponent(node){
	if(node.constructLock)
		return

	node.state = {}
	node.children = []

	ctx.node = node
	ctx.downstream = { ...ctx.downstream }
	ctx.stack = []

	let render = node.construct(node.props, node.content)

	if(!render)
		return

	if(render instanceof Promise){
		node.constructLock = true
		
		render
			.then(render => {
				node.constructLock = false
				node.render = render
				updateComponent(node, node)
			})
			.catch(error => {
				console.error(error)
			})
	}else{
		node.render = render
		node.render(node.props, node.content)
	}

	if(ctx.stack.length === 0)
		return
	
	node.children = ctx.stack

	interlinkNodes(node.children, node)
	createNodes(node.children)
}

function createElement(node){
	node.dom = ctx.createElement(node.element)

	ctx.setAttrs(node, node.attrs)
	ctx.insertElement(
		ctx.parentDom,
		node.dom, 
		findNextSiblingElement(node)
	)

	if(node.content){
		let previousParentDom = ctx.parentDom

		ctx.node = node
		ctx.parentDom = node.dom

		node.children = collectNodes(node.content)
		createNodes(node.children)

		ctx.parentDom = previousParentDom
	}
}


function updateNode(node, newNode){
	if (node.construct === newNode.construct){
		if(node.construct){
			updateComponent(node, newNode)
		}else if(node.element){
			updateElement(node, newNode)
		}
	}else{
		newNode.prevSibling = node.prevSibling
		newNode.nextSibling = node.nextSibling
		removeNode(node)
		createNode(newNode, true)
		Object.assign(node, newNode)
	}
}

function updateComponent(node, newNode){
	let newChildren = []

	ctx.node = node
	ctx.downstream = { ...ctx.downstream }
	ctx.stack = newChildren

	node.render(newNode.props, newNode.content)

	interlinkNodes(newChildren, node)
	updateNodes(node.children, newChildren)
}

function updateElement(node, newNode){
	ctx.setAttrs(node, newNode.attrs, node.attrs)

	if(node.content){
		let previousParentDom = ctx.parentDom

		ctx.parentDom = node.dom

		updateNodes(
			node.children, 
			collectNodes(node.content)
		)

		ctx.parentDom = previousParentDom
	}
}

function removeNodes(nodes){
	for(let node of nodes){
		removeNode(node)
	}
}

function removeNode(node){
	if(node.dom){
		ctx.removeElement(node.dom)
	}else if(node.children){
		for(let child of node.children){
			removeNode(child)
		}
	}
}

function interlinkNodes(nodes, parentNode){
	for(let i=0; i<nodes.length; i++){
		nodes[i].prevSibling = nodes[i-1]
		nodes[i].nextSibling = nodes[i+1]
	}

	if(parentNode){
		nodes[0].prevSibling = parentNode.prevSibling
		nodes[nodes.length-1].nextSibling = parentNode.nextSibling
	}
}

function collectNodes(viewFunc){
	ctx.stack = []

	viewFunc()
	interlinkNodes(ctx.stack)
	
	return ctx.stack
}

function findNextSiblingElement(node){
	let sibling = node.nextSibling

	while(sibling){
		let target = sibling

		while(target.children)
			target = target.children[0]

		if(target?.dom)
			return target.dom
		
		sibling = sibling.nextSibling
	}
}