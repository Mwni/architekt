import { render } from '@architekt/render'
import Element from './element.js'
import createOverlay from './overlay.js'
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

	// just for dev
	dom.ownerDocument.defaultView.rootNode = node

	return node
}


export { Element }