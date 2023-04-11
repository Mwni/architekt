import { render } from '@architekt/render'
import Element from './element.js'
import * as components from './components/index.js'


export function mount(dom, component, props){
	let node = {
		dom: {
			element: dom,
			children: []
		},
		children: [],
		draw: component,
		runtime: {
			createOverlay,
			document: dom.ownerDocument,
			components
		}
	}

	render(node, props)

	dom.ownerDocument.defaultView.rootNode = node

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