import { ctx } from './context.js'


export function create({ ctx: entryCtx, component, props }){
	let node = {
		props,
		factory: () => () => component(props)
	}

	Object.assign(ctx, entryCtx, { node })
	
	render([node])

	console.log(node)
}


function render(nodes){
	createNodes(nodes)
}


function createNodes(nodes){
	for(let node of nodes){
		if(!node)
			continue

		createNode(node)
	}
}

function createNode(node){
	if(node.element){
		console.log('create element', node.element)
		createElement(node)
	}else if(node.factory){
		console.log('create component', node.factory)
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

	console.log('set attrs:', node)
	
	ctx.setAttrs(node, node.attrs)
	ctx.insertElement(ctx.parentDom, node.dom, ctx.nextSibling)

	console.log('set', ctx.parentDom)
}

function createComponent(node){
	node.state = {}
	node.instance = []

	ctx.node = node
	ctx.stack = []

	let render = node.factory(node.props)

	render(node.props)

	node.instance = ctx.stack

	console.log('created component', node)

	if(node.instance.length === 1){
		createNode(node.instance[0])
		node.dom = node.instance[0].dom
	}
}