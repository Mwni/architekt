import { Component } from '@architekt/render'
import Element from '../element.js'

export default Component(({ ctx, ...props }) => {
	return newProps => {
		if(props.svg !== newProps.svg || props.blob !== newProps.blob || props.url !== newProps.url)
			return ctx.teardown()

		let src

		if(props.svg)
			src = toSvgUrl('', props.svg)
		else if(props.blob)
			src = toBlobUrl(props.blob)
		else
			src = props.url
	
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

function toSvgUrl(type, svg){
	let header = 'data:image/svg+xml,'
	let encoded = encodeURIComponent(svg)
		.replace(/'/g, '%27')
		.replace(/"/g, '%22')

	return header + encoded
}

function toBlobUrl(blob){
	return (window.URL || window.webkitURL).createObjectURL(blob)
}