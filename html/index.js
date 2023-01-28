import { render } from '@architekt/render'
import { createElementWrap as createElement, insertElement, removeElement, setAttrs, Element } from './dom.js'
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
		document: dom.ownerDocument,
	}

	let node = {
		construct: component.construct,
		props,
		parentNode: {
			dom
		}
	}

	node.parentNode.children = [node]

	render(ctx, node)

	return node
}

export { Element }