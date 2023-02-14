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
		component,
		props,
		parentNode: {
			dom
		}
	}

	node.parentNode.children = [node]

	render(ctx, node)

	return node
}


let activeOverlay
let queuedOverlays = []

function createOverlay(ctx, component, props){
	if(activeOverlay){
		queuedOverlays.push([ctx, component, props])
		return
	}

	let dom = createElement('div')
	let overlay = activeOverlay = {
		close: () => {
			ctx.runtime.document.body.removeChild(dom)
			activeOverlay = undefined
			
			if(queuedOverlays.length > 0){
				createOverlay(...queuedOverlays.shift())
			}
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