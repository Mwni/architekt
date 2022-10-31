import { render } from '@architekt/engine'
import { createElement, insertElement, setAttrs } from './dom.js'
import * as components from './components/index.js'



export function mount(dom, component, props){
	let ctx = {
		components,
		createElement, 
		insertElement,
		setAttrs,
		parentDom: dom
	}

	render(ctx, component, props)
}