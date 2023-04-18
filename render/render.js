import { dispatchCallbacks } from './callbacks.js'
import Context from './context.js'


export const renderState = {
	runtime: undefined,
	stack: undefined,
}

export function render(node){
	renderNode(node)
	walkNodes(node, node => dispatchCallbacks(node, 'afterRender'))
}

export function renderNode(node){
	renderState.runtime = node.runtime

	let stack = viewStack(
		node, 
		node.draw, 
		node.props, 
		node.content
	)

	if(node.teardown){
		deleteNode(node)
		node.parent.children[node.index] = createNode(node, node.index)
		return
	}

	let commonLength = Math.min(node.children.length, stack.length)

	for (let i=0; i<commonLength; i++){
		let n = node.children[i]
		let blueprint = stack[i]

		if(needsTeardown(n, blueprint)){
			deleteNode(n)
			node.children[i] = createNode(blueprint, i)
		}else{
			Object.assign(n, {
				props: blueprint.props,
				content: blueprint.content
			})
			renderNode(n)
		}
	}

	if(node.children.length > commonLength){
		for(let n of node.children.splice(commonLength)){
			deleteNode(n)
		}
	}else if(stack.length > commonLength){
		for(let blueprint of stack.slice(commonLength)){
			node.children.push(
				createNode(blueprint, node.children.length)
			)
		}
	}
}

function needsTeardown(node, blueprint){
	return node.teardown || node.component !== blueprint.component
}


function createNode(blueprint, index){
	let node = {
		index,
		state: {},
		children: [],
		props: blueprint.props,
		content: blueprint.content,
		component: blueprint.component,
		parent: blueprint.parent,
		runtime: blueprint.parent.runtime,
		xid: Math.random()
	}

	let stackOrDraw = viewStack(
		node, 
		blueprint.component.construct,
		blueprint.props,
		blueprint.content
	)

	if(stackOrDraw instanceof Promise){
		node.draw = () => {}
		node.constructPromise = stackOrDraw
			.then(f => {
				node.constructPromise = undefined

				if(node.deleted)
					return

				node.draw = f
				render(node)
			})
			.catch(error => {
				node.constructPromise = undefined
				node.error = error
				console.warn(`error while rendering async component:\n`, error)
			})

		return node
	}else if(typeof stackOrDraw === 'function'){
		node.draw = stackOrDraw
		stackOrDraw = viewStack(
			node, 
			stackOrDraw,
			blueprint.props,
			blueprint.content
		)
	}else{
		node.draw = blueprint.component.construct
	}

	for(let blueprint of stackOrDraw){
		node.children.push(
			createNode(blueprint, node.children.length)
		)
	}

	return node
}

function deleteNode(node){
	node.deleted = true
	walkNodes(node, node => dispatchCallbacks(node, 'afterDelete'))
}

function viewStack(node, draw, props, content){
	let stack = renderState.stack = []
	let contentFunc

	if(typeof content === 'function'){
		contentFunc = (...args) => {
			let offset = renderState.stack.length
			return content(...args) || renderState.stack.slice(offset)
		}
	}else if(Array.isArray(content)){
		contentFunc = () => {
			renderState.stack.push(...content)
			return content
		}
	}

	let returnedStack = draw(
		{
			...props,
			ctx: new Context(node)
		}, 
		contentFunc
	)

	renderState.stack = undefined

	// special case for components
	if(typeof returnedStack === 'function' || returnedStack instanceof Promise)
		return returnedStack

	// use patched
	if(Array.isArray(returnedStack))
		stack = returnedStack

	if(returnedStack?.component || returnedStack?.view)
		stack = [returnedStack]


	let fullstack = []

	for(let blueprint of stack){
		if(blueprint.view){
			fullstack.push(
				...viewStack(
					node, 
					blueprint.view,
					blueprint.props,
					blueprint.content
				)
			)
		}else{
			fullstack.push(blueprint)
		}
	}

	return fullstack.map(
		blueprint => ({
			...blueprint,
			parent: node
		})
	)
}

export function createDom(node, element){
	let parentNode = node
	let parentDom
	let index = [node.index]

	while(parentNode = parentNode.parent){
		parentDom = parentNode.dom

		if(parentDom)
			break

		index.unshift(parentNode.index)
	}

	let insertAfter = parentDom.children.length - 1

	while(insertAfter >= 0){
		let child = parentDom.children[insertAfter]

		if(child.index.some((i, p) => i < index[p]))
			break
		else
			insertAfter--
	}

	node.dom = {
		parent: parentDom,
		element,
		children: []
	}

	parentDom.element.insertBefore(
		element,
		parentDom.children[insertAfter + 1]?.element
	)

	parentDom.children.splice(
		Math.max(0, insertAfter + 1),
		0,
		{
			element,
			index
		}
	)
}

export function deleteDom(node, element){
	node.dom.parent.element.removeChild(element)
	node.dom.parent.children = node.dom.parent.children.filter(
		child => child.element !== element
	)
}

export function walkNodes(node, func){
	func(node)

	for(let child of node.children){
		walkNodes(child, func)
	}
}

export function awaitAsyncNodes(node, callback){
	let promises = []

	walkNodes(
		node,
		node => {
			if(node.constructPromise)
				promises.push(node.constructPromise)
		}
	)

	if(promises.length > 0){
		Promise
			.all(promises)
			.then(() => awaitAsyncNodes(node, callback))
	}else{
		callback()
	}
}

