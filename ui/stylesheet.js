import { ctx, findParentElement, Component } from '@architekt/render'

export default Component(({ xid }) => {
	let { node } = ctx
	let dom = findParentElement(node)
	
	dom.classList.add(xid)
})