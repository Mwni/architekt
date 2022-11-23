import { ctx } from './context.js'


export function render(scope, node){
	Object.assign(ctx, scope, { node })

	updateNodes(
		scope.node ? [scope.node] : [], 
		[node]
	)

	walkNodes(
		node,
		node => {
			dispatchCallbacks(node, 'afterDraw')
		}
	)
}

function updateNodes(nodes, newNodes){
	let commonLength = Math.min(nodes.length, newNodes.length)

	for (let i=0; i<commonLength; i++){
		nodes[i] = updateNode(nodes[i], newNodes[i])
	}

	if(nodes.length > commonLength){
		removeNodes(nodes.slice(commonLength))
		nodes.splice(commonLength)

		if(commonLength)
			nodes[commonLength - 1].nextSibling = undefined
	}else if(newNodes.length > commonLength){
		let newNodesSlice = newNodes.slice(commonLength)

		createNodes(newNodesSlice)
		nodes.push(...newNodesSlice)

		if(commonLength)
			nodes[commonLength - 1].nextSibling = newNodesSlice[0]
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

	let prevDownstream = ctx.downstream

	ctx.node = node
	ctx.downstream = { ...ctx.downstream }

	node.state = {}
	node.children = []
	node.render = node.construct(node.props, node.content)
	node.downstream = ctx.downstream

	if(!node.render)
		return

	if(node.render instanceof Promise){
		node.constructLock = true
		node.render
			.then(render => {
				node.constructLock = false
				node.render = render
				updateComponent(node, node)
			})
			.catch(error => {
				console.error(error)
			})

		return
	}

	node.children = collectChildren(
		node, 
		node.render, 
		node.props, 
		node.content
	)

	createNodes(node.children)

	ctx.downstream = prevDownstream

	dispatchCallbacks(node, 'afterDomCreation', getChildElements(node))
}

function createElement(node){
	let parentElement = findParentElement(node)
	let siblingElement = findNextSiblingElement(node, parentElement)

	node.dom = ctx.createElement(node.element)

	ctx.setAttrs(node, node.attrs)
	ctx.insertElement(parentElement, node.dom, siblingElement)

	if(node.content){
		node.children = collectChildren(node, node.content)
		createNodes(node.children)
	}else{
		node.children = []
	}
}


function updateNode(node, newNode){
	let needsTeardown = node.construct !== newNode.construct
		|| node.element !== newNode.element

	if (!needsTeardown){
		if(node.construct){
			updateComponent(node, newNode)
		}else if(node.element){
			updateElement(node, newNode)
		}
	}

	if(needsTeardown || node.teardown){
		replaceNode(node, newNode)
		return newNode
	}

	return node
}

function updateComponent(node, newNode){
	node.props = newNode.props
	node.content = newNode.content

	if(!node.render)
		return

	ctx.downstream = { ...ctx.downstream, ...node.downstream }

	let newChildren = collectChildren(
		node,
		node.render,
		newNode.props,
		newNode.content
	)

	if(!node.teardown)
		updateNodes(node.children, newChildren)
}

function updateElement(node, newNode){
	ctx.setAttrs(node, newNode.attrs, node.attrs)

	node.attrs = newNode.attrs

	if(node.content){
		updateNodes(
			node.children, 
			collectChildren(node, node.content)
		)
	}
}

function replaceNode(node, newNode){
	newNode.parentNode = node.parentNode
	newNode.prevSibling = node.prevSibling
	newNode.nextSibling = node.nextSibling
	
	removeNode(node)
	createNode(newNode)

	if(node.prevSibling)
		node.prevSibling.nextSibling = newNode

	if(node.nextSibling)
		node.nextSibling.prevSibling = newNode
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

function collectChildren(node, render, props, content){
	let children = []
	let prevDownstream = ctx.downstream

	ctx.node = node
	ctx.downstream = { ...ctx.downstream }
	ctx.stack = children

	render(props, content)

	for(let i=0; i<children.length; i++){
		children[i].parentNode = node
		children[i].prevSibling = children[i-1]
		children[i].nextSibling = children[i+1]
	}

	ctx.downstream = prevDownstream

	return children
}

export function findParentElement(node){
	while(node.parentNode){
		node = node.parentNode

		if(node.dom)
			return node.dom
	}
}

function findNextSiblingElement(node, upToElement){
	while(node && node.dom !== upToElement){
		let sibling = node.nextSibling

		while(sibling){
			if(sibling.dom)
				return sibling.dom
			else
				sibling = sibling.children?.[0]
		}

		node = node.parentNode
	}
}

function getChildElements(node){
	let elements = []

	if(node.children){
		for(let child of node.children){
			if(child.dom)
				elements.push(child.dom)
			else
				elements.push(...getChildElements(child.children))
		}
	}

	return elements
}

export function walkNodes(node, func){
	func(node)

	if(!node.children)
		return

	for(let child of node.children){
		walkNodes(child, func)
	}
}

function dispatchCallbacks(node, type, value){
	if(!node.callbacks)
		return

	for(let i=0; i<node.callbacks.length; i++){
		let e = node.callbacks[i]

		if(e.type === type){
			node.callbacks.splice(i, 1)
			e.callback(value)
			i--
		}
	}
}