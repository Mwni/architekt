import { create } from '@architekt/engine'
import { createElement, insertElement, setAttrs } from './dom.js'
import * as components from './components/index.js'



export function mount(dom, component, props){
	let instance = create({
		ctx: {
			components,
			createElement, 
			insertElement,
			setAttrs,
			parentDom: dom
		},
		component,
		props,
	})
}