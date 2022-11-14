import { render } from '@architekt/render'
import { createElementWrap as createElement, insertElement, removeElement, setAttrs } from './dom.js'
import * as components from './components/index.js'



export function mount(dom, component, props){
	let ctx = {
		downstream: {},
		upstream: {},
		components,
		createElement, 
		insertElement,
		removeElement,
		setAttrs,
		parentDom: dom,
		document: dom.ownerDocument,
	}

	render(ctx, {
		construct: component.construct,
		props
	})
}