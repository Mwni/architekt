import { renderState } from './render.js'


export default construct => {
	let component = (props, content) => {
		if(typeof props === 'function'){
			content = props
			props = {}
		}

		let blueprint = {
			component,
			props,
			content
		}

		renderState.stack.push(blueprint)

		return blueprint
	}

	return Object.assign(component, { construct })
}