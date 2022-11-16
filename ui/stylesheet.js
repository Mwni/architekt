import { ctx, Component } from '@architekt/render'

export default Component(({ xid }) => {
	let { node } = ctx

	return () => {
		node.afterDraw = () => apply(node, xid)
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