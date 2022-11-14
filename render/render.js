import { ctx } from './context.js'


export function render(scope, component, props){
	Object.assign(ctx, scope)

	let node = { 
		component,
		factory: component.factory,
		props
	}

	updateNodes([node], scope.node ? [scope.node] : undefined)

	Object.assign(ctx, { node })
}

function updateNodes(nodes, previousNodes){
	if(previousNodes === nodes || (!previousNodes && !nodes))
		return

	if(!previousNodes || previousNodes.length === 0){
		createNodes(nodes)
		return
	}

	if(!nodes || nodes.length === 0){
		removeNodes(previousNodes)
		return
	}

	let commonLength = Math.min(nodes.length, previousNodes.length)

	for (let i=0; i<commonLength; i++){
		let o = previousNodes[i]
		let v = nodes[i]

		if (o === v || (!o && !v))
			continue

		if(o)
			updateNode(v, o)
		else if(v)
			createNode(v)
		else
			removeNode(o)
	}

	if(previousNodes.length > commonLength)
		removeNodes(previousNodes, commonLength)

	if(nodes.length > commonLength)
		createNodes(nodes, commonLength)
	
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

	interlinkNodes(node.instance)
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


function updateNode(node, previousNode){
	if (node.factory === previousNode.factory){
		node.render = previousNode.render
		node.state = previousNode.state
		node.events = previousNode.events

		//if(shouldNotUpdate(node, previousNode)) 
		//	return

		if(previousNode.factory){
			updateComponent(node, previousNode)
		}else if(previousNode.element){
			updateElement(node, previousNode)
		}

		//hack
		Object.assign(previousNode, node)
	}else{
		console.log('teardown', previousNode, node)
		removeNode(previousNode)
		createNode(node)
	}
}

function updateComponent(node, previousNode){
	ctx.node = node
	ctx.stack = []

	node.render(node.props, node.content)
	node.instance = ctx.stack
	
	interlinkNodes(node.instance)
	//updateLifecycle(vnode.state, vnode, hooks)

	if(!previousNode.instance){
		createNodes(node.instance)
	}else{
		updateNodes(node.instance, previousNode.instance)
	}
}

function updateElement(node, previousNode){
	node.dom = previousNode.dom
	ctx.setAttrs(node, node.attrs, previousNode.attrs)

	if(node.content){
		let previousParentDom = ctx.parentDom

		ctx.parentDom = node.dom
		node.children = collectNodes(node.content)
		updateNodes(node.children, previousNode.children, null)
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

function interlinkNodes(nodes){
	for(let i=0; i<nodes.length; i++){
		nodes[i].prevSibling = nodes[i-1]
		nodes[i].nextSibling = nodes[i+1]
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
		let element = sibling.dom?.[0]

		while(element && Array.isArray(element))
			element = element[0]

		if(element)
			return element
		
		sibling = sibling.nextSibling
	}
}