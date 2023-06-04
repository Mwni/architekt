import { registerCallback } from './callbacks.js'
import { render } from './render.js'


export default class Context{
	constructor(node){
		this.node = node
		this.runtime = node.runtime
	}

	get isServer(){
		return this.runtime.isServer
	}

	get isClient(){
		return !this.runtime.isServer
	}

	get parent(){
		return new Context(this.node.parent)
	}

	get cookies(){
		return this.runtime.cookies
	}

	get global(){
		return this.node.global
	}

	get state(){
		return this.node.state
	}

	get dom(){
		return collectDom(this.node)
	}

	get upstream(){
		let accumulated = {...this.node.public}
		let node = this.node

		while(node = node.parent){
			if(node.public)
				accumulated = {
					...node.public,
					...accumulated
				}
		}

		return accumulated
	}

	public(data){
		this.node.public = {
			...this.node.public,
			...data
		}
	}

	redraw({ all } = {}){
		render(this.node)
	}
	
	teardown(){
		this.node.teardown = true
	}

	afterRender(callback){
		registerCallback(this.node, 'afterRender', callback)
	}

	beforeDelete(callback){
		registerCallback(this.node, 'beforeDelete', callback)
	}

	afterDelete(callback){
		registerCallback(this.node, 'afterDelete', callback)
	}

	createOverlay(content){
		let orgDraw = this.node.draw
		let Overlay = this.runtime.createOverlay(content)
		let handle = {
			close: () => {
				this.node.draw = orgDraw || (() => {})
				render(this.node)
			}
		}

		this.node.draw = (...args) => {
			if(orgDraw)
				orgDraw(...args)

			Overlay({ handle })
		}

		render(this.node)

		return handle
	}
}


function collectDom(node){
	let elements = []

	for(let child of node.children){
		if(child.dom)
			elements.push(child.dom.element)
		else
			elements.push(...collectDom(child))
	}

	return elements
}


/*
import { renderState, render, registerCallback } from '@architekt/render'


export function getContext(){
	let scope = { ...ctx }

	return {
		...scope.downstream,
		node: scope.node,
		runtime: scope.runtime,
		cookies: scope.runtime.cookies,
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

			if(ctx.runtime.renderPass){
				ctx.runtime.nextRender = {
					scope: renderScope,
					node
				}
			}else{
				render(renderScope, node)
			}
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
		},
		createOverlay: (component, props) => {
			scope.runtime.createOverlay(scope, component, props)
		}
	}
}
*/