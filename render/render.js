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

function updateNodes(nodes, previousNodes, nextSibling){
	if(previousNodes === nodes || (!previousNodes && !nodes))
		return

	if(!previousNodes || previousNodes.length === 0){
		createNodes(nodes, nextSibling)
		return
	}

	if(!nodes || nodes.length === 0){
		removeNodes(previousNodes)
		return
	}

	let isPreviousKeyed = previousNodes[0] && previousNodes[0].key != null
	let isKeyed = nodes[0] && nodes[0].key != null

	let start = 0
	let oldStart = 0

	if(!isPreviousKeyed){
		while(oldStart < previousNodes.length && !previousNodes[oldStart]) 
			oldStart++
	}

	if(!isKeyed){
		while(start < nodes.length && !nodes[start]) 
			start++
	}

	if(isPreviousKeyed !== isKeyed){
		removeNodes(previousNodes.slice(oldStart))
		createNodes(nodes.slice(start), nextSibling)
	}else if(!isKeyed){
		let commonLength = previousNodes.length < nodes.length 
			? previousNodes.length 
			: nodes.length
	
		start = start < oldStart ? start : oldStart

		for (; start < commonLength; start++){
			let o = previousNodes[start]
			let v = nodes[start]

			if (o === v || (!o && !v))
				continue

			if(!v){
				removeNode(o)
				continue
			}

			let sibling = getNextSibling(previousNodes, start + 1) || nextSibling
			
			if(o)
				updateNode(v, o, sibling)
			else
				createNode(v, sibling)
		}

		if(previousNodes.length > commonLength)
			removeNodes(previousNodes.slice(start))

		if(nodes.length > commonLength)
			createNodes(nodes.slice(start), nextSibling)
	}else{
		throw Error(`Keyed diffing is not implemented.`)
	}
}


function createNodes(nodes, nextSibling, offset){
	for(let i=offset || 0; i<nodes.length; i++){
		let node = nodes[i]

		if(!node)
			continue

		createNode(node, nextSibling)
	}
}

function createNode(node, nextSibling){
	if(node.factory){
		createComponent(node, nextSibling)
	}else if(node.element){
		createElement(node, nextSibling)

		if(node.content){
			let previousParentDom = ctx.parentDom
	
			ctx.parentDom = node.dom
			viewNodeContent(node)
			createNodes(node.children, nextSibling)
			ctx.parentDom = previousParentDom
		}
	}
}

function createComponent(node, nextSibling){
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

	createNodes(node.instance, nextSibling)

	node.dom = node.instance
		.map(({ dom }) => dom)
		.filter(dom => dom)
}

function createElement(node, nextSibling){
	node.dom = ctx.createElement(node.element)
	
	ctx.setAttrs(node, node.attrs)
	ctx.insertElement(ctx.parentDom, node.dom, nextSibling)
}


function updateNode(node, previousNode, nextSibling){
	if (node.factory === previousNode.factory){
		node.render = previousNode.render
		node.state = previousNode.state
		node.events = previousNode.events

		//if(shouldNotUpdate(node, previousNode)) 
		//	return

		if(previousNode.factory){
			updateComponent(node, previousNode, nextSibling)
		}else if(previousNode.element){
			updateElement(node, previousNode)

			if(node.content){
				let previousParentDom = ctx.parentDom
		
				ctx.parentDom = node.dom
				viewNodeContent(node)
				updateNodes(node.children, previousNode.children, null)
				ctx.parentDom = previousParentDom
			}
		}

		//hack
		Object.assign(previousNode, node)
	}else{
		removeNode(previousNode)
		createNode(node, nextSibling)
	}
}

function updateElement(node, previousNode){
	node.dom = previousNode.dom
	ctx.setAttrs(node, node.attrs, previousNode.attrs)
}

function updateComponent(node, previousNode, nextSibling){
	ctx.node = node
	ctx.stack = []

	node.render(node.props, node.content)
	node.instance = ctx.stack

	//updateLifecycle(vnode.state, vnode, hooks)

	if(!previousNode.instance){
		createNodes(node.instance, nextSibling)
	}else{
		updateNodes(node.instance, previousNode.instance, nextSibling)
	}

	node.dom = node.instance
		.map(({ dom }) => dom)
		.filter(dom => dom)
}

function removeNodes(nodes){
	for(let node of nodes){
		if(!node)
			continue

		removeNode(node)
	}
}

function removeNode(node){
	if(node.dom){
		for(let element of node.dom){
			ctx.removeElement(element)
		}
	}
}

function viewNodeContent(node){
	if(typeof node.content !== 'function'){
		throw new Error(`Component's content parameter must either be a closure or left blank, not ${typeof node.content}`)
	}

	ctx.stack = []
	node.content()
	node.children = ctx.stack
}

function getNextSibling(nodes, startIndex){
	let sibling

	for(let i=startIndex; i<nodes.length; i++){
		sibling = nodes[i]?.dom

		while(sibling && Array.isArray(sibling))
			sibling = sibling[0]
	}

	return sibling
}