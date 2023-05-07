import { Component } from '@architekt/render'
import Element from '../element.js'

export default Component(({ ctx, svg, blob, url, ...props }) => {
	let src

	if(svg)
		src = toSvgUrl(svg)
	else if(blob)
		src = toBlobUrl(blob)
	else
		src = url

	return newProps => {
		if(svg !== newProps.svg || blob !== newProps.blob || url !== newProps.url)
			return ctx.teardown()
	
		Element(
			{
				...props,
				tag: 'img',
				class: ['a-image', props.class],
				src
			}
		)
	}
})

function toSvgUrl(svg){
	let header = 'data:image/svg+xml,'
	let encoded = encodeURIComponent(svg)
		.replace(/'/g, '%27')
		.replace(/"/g, '%22')

	return header + encoded
}

function toBlobUrl(blob){
	return (window.URL || window.webkitURL).createObjectURL(blob)
}