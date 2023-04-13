import { Component } from '@architekt/render'
import { Absolute } from '@architekt/ui'


export default function createOverlay(content){
	return Component(({ ctx, handle }) => {
		ctx.public({ overlay: handle })
		ctx.node.dom = {
			element: ctx.runtime.document.body,
			children: []
		}

		return () => {
			Absolute({ class: 'a-overlay' }, () => {
				content()
			})
		}
	})
}