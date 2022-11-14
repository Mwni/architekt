import { ctx } from './context.js'


export function render(scope, component, props){
	Object.assign(ctx, scope)

	let node = { 
		component,
		factory: component.factory,
		props
	}

	updateNodes(scope.node ? [scope.node] : undefined, [node])

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
		let o = nodes[i]
		let v = newNodes[i]

		if (o === v || (!o && !v))
			continue

		if(o)
			updateNode(o, v)
		else if(v)
			createNode(v)
		else
			removeNode(o)
	}

	if(nodes.length > commonLength)
		removeNodes(nodes, commonLength)

	if(newNodes.length > commonLength)
		createNodes(newNodes, commonLength)
	
}


function createNodes(nodes, offset){
	for(let i=offset || 0; i<nodes.length; i++){
		createNode(nodes[i])
	}
}

function createNode(node){
	if(node.factory){
		createComponent(node)
	}else if(node.element){
		createElement(node)
	}
}

function createComponent(node){
	node.state = {}
	node.instance = []

	ctx.node = node
	ctx.downstream = { ...ctx.downstream }
	ctx.stack = []

	let potentialRender = node.factory(node.props, node.content)

	if(typeof potentialRender === 'function'){
		node.render = potentialRender
		node.render(node.props, node.content)
	}else{
		node.render = node.factory
	}

	if(ctx.stack.length === 0)
		return
	
	node.instance = ctx.stack

	interlinkNodes(node.instance, node)
	createNodes(node.instance)
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
	if (node.factory === newNode.factory){
		if(node.factory){
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
	let newInstance = []

	ctx.node = node
	ctx.stack = newInstance

	node.render(newNode.props, newNode.content)
	interlinkNodes(newInstance)

	if(!node.instance){
		createNodes(newInstance)
		node.instance = newInstance
	}else{
		updateNodes(node.instance, newInstance)
	}
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

function removeNodes(nodes, offset){
	for(let i=offset || 0; i<nodes.length; i++){
		removeNode(nodes[i])
	}
}

function removeNode(node){
	if(node.dom){
		ctx.removeElement(node.dom)
	}else if(node.instance){
		for(let subNode of node.instance){
			removeNode(subNode)
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

		while(target.instance)
			target = target.instance[0]

		if(target?.dom)
			return target.dom
		
		sibling = sibling.nextSibling
	}
}