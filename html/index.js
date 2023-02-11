import { render } from '@architekt/render'
import { createElementWrap as createElement, insertElement, removeElement, setAttrs, Element } from './dom.js'
import * as components from './components/index.js'


export function mount(dom, component, props, ctxOverride){
	let ctx = {
		downstream: {},
		upstream: {},
		runtime: {
			components,
			createElement, 
			insertElement,
			removeElement,
			setAttrs,
			createOverlay,
			document: dom.ownerDocument,
		},
		...ctxOverride
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

function createOverlay(ctx, component, props){
	let dom = createElement('div')
	let overlay = {
		close: () => {
			ctx.runtime.document.body.removeChild(dom)
		}
	}

	dom.className = 'a-overlay'
	ctx.runtime.document.body.appendChild(dom)

	mount(dom, component, props, {
		downstream: {
			...ctx.downstream,
			overlay
		},
		upstream: ctx.upstream,
	})

	return overlay
}


export { Element }