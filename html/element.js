import { Component, createDom, deleteDom } from '@architekt/render'
import { setAttrs } from './dom.js'


export default Component(({ ctx, tag }) => {
	let prevAttrs
	let element

	if(tag === 'body'){
		element = ctx.runtime.document.body
		ctx.node.dom = { 
			element,
			children: []
		}
	}else{
		element = ctx.runtime.document.createElement(tag)

		createDom(ctx.node, element)

		ctx.afterDelete(() => {
			deleteDom(ctx.node, element)
		})
	}

	return ({ tag: newTag, ...attrs }, content) => {
		if(newTag !== tag){
			ctx.teardown()
			return
		}

		if(typeof content === 'string'){
			attrs.textContent = content
			content = undefined
		}

		if(attrs.class)
			attrs.class = flattenClass(attrs.class)

		setAttrs(element, attrs, prevAttrs)
		prevAttrs = attrs

		return content ? content() : undefined
	}
})

function flattenClass(c){
	return Array.isArray(c)
		? c.filter(Boolean).map(flattenClass).join(' ')
		: c
}