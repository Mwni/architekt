import { getContext, Component } from './index.js'

export default Component(({ xid }) => {
	let { node, afterDraw } = getContext()

	return () => {
		afterDraw(() => apply(node.parentNode, xid))
	}
})

function apply(node, xid){
	if(node.dom){
		node.dom.classList.add(xid)
		return
	}

	for(let child of node.children){
		apply(child, xid)
	}
}