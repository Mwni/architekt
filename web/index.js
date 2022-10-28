import { create } from '@architekt/engine'
import * as components from './components/index.js'



export function mount(dom, component, props){
	let instance = create({
		components,
		component,
		props,
	})
}