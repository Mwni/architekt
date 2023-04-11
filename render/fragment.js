import { renderState } from './render.js'

export default view => {
	return (props, content) => {
		if(typeof props === 'function'){
			content = props
			props = {}
		}

		let fragment = {
			view,
			props,
			content
		}

		renderState.stack.push(fragment)

		return fragment
	}
}