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

			if(!o)
				createNode(v, getNextSibling(previousNodes, start + 1, nextSibling))
			else if(!v)
				removeNode(o)
			else
				updateNode(v, o, getNextSibling(previousNodes, start + 1, nextSibling))
		}

		if(previousNodes.length > commonLength)
			removeNodes(parent, old, start, old.length)

		if(nodes.length > commonLength)
			createNodes(nodes.slice(start), nextSibling)
	}else{
		throw Error(`Keyed diffing is not implemented.`)
		/*
		// keyed diff
		var oldEnd = old.length - 1, end = vnodes.length - 1, map, o, v, oe, ve, topSibling

		// bottom-up
		while (oldEnd >= oldStart && end >= start) {
			oe = old[oldEnd]
			ve = vnodes[end]
			if (oe.key !== ve.key) break
			if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns)
			if (ve.dom != null) nextSibling = ve.dom
			oldEnd--, end--
		}
		// top-down
		while (oldEnd >= oldStart && end >= start) {
			o = old[oldStart]
			v = vnodes[start]
			if (o.key !== v.key) break
			oldStart++, start++
			if (o !== v) updateNode(parent, o, v, hooks, getNextSibling(old, oldStart, nextSibling), ns)
		}
		// swaps and list reversals
		while (oldEnd >= oldStart && end >= start) {
			if (start === end) break
			if (o.key !== ve.key || oe.key !== v.key) break
			topSibling = getNextSibling(old, oldStart, nextSibling)
			moveDOM(parent, oe, topSibling)
			if (oe !== v) updateNode(parent, oe, v, hooks, topSibling, ns)
			if (++start <= --end) moveDOM(parent, o, nextSibling)
			if (o !== ve) updateNode(parent, o, ve, hooks, nextSibling, ns)
			if (ve.dom != null) nextSibling = ve.dom
			oldStart++; oldEnd--
			oe = old[oldEnd]
			ve = vnodes[end]
			o = old[oldStart]
			v = vnodes[start]
		}
		// bottom up once again
		while (oldEnd >= oldStart && end >= start) {
			if (oe.key !== ve.key) break
			if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns)
			if (ve.dom != null) nextSibling = ve.dom
			oldEnd--, end--
			oe = old[oldEnd]
			ve = vnodes[end]
		}
		if (start > end) removeNodes(parent, old, oldStart, oldEnd + 1)
		else if (oldStart > oldEnd) createNodes(parent, vnodes, start, end + 1, hooks, nextSibling, ns)
		else {
			// inspired by ivi https://github.com/ivijs/ivi/ by Boris Kaul
			var originalNextSibling = nextSibling, vnodesLength = end - start + 1, oldIndices = new Array(vnodesLength), li=0, i=0, pos = 2147483647, matched = 0, map, lisIndices
			for (i = 0; i < vnodesLength; i++) oldIndices[i] = -1
			for (i = end; i >= start; i--) {
				if (map == null) map = getKeyMap(old, oldStart, oldEnd + 1)
				ve = vnodes[i]
				var oldIndex = map[ve.key]
				if (oldIndex != null) {
					pos = (oldIndex < pos) ? oldIndex : -1 // becomes -1 if nodes were re-ordered
					oldIndices[i-start] = oldIndex
					oe = old[oldIndex]
					old[oldIndex] = null
					if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns)
					if (ve.dom != null) nextSibling = ve.dom
					matched++
				}
			}
			nextSibling = originalNextSibling
			if (matched !== oldEnd - oldStart + 1) removeNodes(parent, old, oldStart, oldEnd + 1)
			if (matched === 0) createNodes(parent, vnodes, start, end + 1, hooks, nextSibling, ns)
			else {
				if (pos === -1) {
					// the indices of the indices of the items that are part of the
					// longest increasing subsequence in the oldIndices list
					lisIndices = makeLisIndices(oldIndices)
					li = lisIndices.length - 1
					for (i = end; i >= start; i--) {
						v = vnodes[i]
						if (oldIndices[i-start] === -1) createNode(parent, v, hooks, ns, nextSibling)
						else {
							if (lisIndices[li] === i - start) li--
							else moveDOM(parent, v, nextSibling)
						}
						if (v.dom != null) nextSibling = vnodes[i].dom
					}
				} else {
					for (i = end; i >= start; i--) {
						v = vnodes[i]
						if (oldIndices[i-start] === -1) createNode(parent, v, hooks, ns, nextSibling)
						if (v.dom != null) nextSibling = vnodes[i].dom
					}
				}
			}
		}*/
	}
}


function createNodes(nodes, nextSibling){
	for(let node of nodes){
		if(!node)
			continue

		createNode(node, nextSibling)
	}
}

function createNode(node, nextSibling){
	if(node.element){
		createElement(node)
	}else if(node.factory){
		createComponent(node)
	}

	if(node.content){
		if(typeof node.content !== 'function'){
			throw new Error(`Component's content parameter must either be a closure or left blank, not ${typeof node.content}`)
		}

		ctx.stack = []

		node.content()
		node.children = ctx.stack

		let previousParentDom = ctx.parentDom

		ctx.parentDom = node.dom

		createNodes(node.children, null)

		ctx.parentDom = previousParentDom
	}
}

function createElement(node){
	node.dom = ctx.createElement(node.element)
	
	ctx.setAttrs(node, node.attrs)
	ctx.insertElement(ctx.parentDom, node.dom, ctx.nextSibling)
}

function createComponent(node){
	node.state = {}
	node.instance = []

	ctx.node = node
	ctx.stack = []

	node.render = node.factory(node.props)
	node.render(node.props)
	node.instance = ctx.stack

	if(node.instance.length === 1){
		createNode(node.instance[0])
		node.dom = node.instance[0].dom
	}
}


function updateNode(node, previousNode, nextSibling){
	if (node.factory === previousNode.factory){
		node.render = previousNode.render
		node.state = previousNode.state
		node.events = previousNode.events

		//if(shouldNotUpdate(node, previousNode)) 
		//	return

		if(previousNode.element){
			updateElement(node, previousNode)
		}else{
			updateComponent(node, previousNode, nextSibling)
		}

		if(node.content){
			if(typeof node.content !== 'function'){
				throw new Error(`Component's content parameter must either be a closure or left blank, not ${typeof node.content}`)
			}
	
			ctx.stack = []
	
			node.content()
			node.children = ctx.stack
	
			let previousParentDom = ctx.parentDom
	
			ctx.parentDom = node.dom
	
			updateNodes(node.children, previousNode.children, null)
	
			ctx.parentDom = previousParentDom
		}
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

	node.render(node.props)
	node.instance = ctx.stack

	//updateLifecycle(vnode.state, vnode, hooks)

	if(!previousNode.instance)
		createNode(node.instance[0], nextSibling)
	else
		updateNode(node.instance[0], previousNode.instance[0], nextSibling)

	node.dom = node.instance.dom
}

function getNextSibling(nodes, startIndex, nextSibling){
	for(let i=startIndex; i<nodes.length; i++){
		if(nodes[i] && nodes[i].dom) 
			return nodes[i].dom
	}

	return nextSibling
}