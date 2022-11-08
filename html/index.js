import { render } from '@architekt/render'
import { createElement, insertElement, removeElement, setAttrs } from './dom.js'
import * as components from './components/index.js'



export function mount(dom, component, props){
	let ctx = {
		components,
		createElement, 
		insertElement,
		removeElement,
		setAttrs,
		parentDom: dom
	}

	render(ctx, component, props)
}