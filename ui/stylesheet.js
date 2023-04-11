import { Component } from './index.js'

export default Component(({ ctx, xid }) => {
	ctx.afterRender(() => {
		for(let element of ctx.parent.dom){
			element.classList.add(xid)
		}
	})
})