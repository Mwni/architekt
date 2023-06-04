import { getElementDocPosition } from './dom.js'

export function createSnapshot({ element }){
	console.log(element)
	return {
		element,
		position: getElementDocPosition(element),
		parent: element.parentNode && element.parentNode !== document.body
			? createSnapshot({ element: element.parentNode })
			: undefined
	}
}

export function createPhantom({ element, snapshot }){
	element = element.cloneNode()

	snapshot.parent.element.appendChild(element)

	return { element }
}