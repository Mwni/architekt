import { Fragment } from '@architekt/render'
import Element from '../element.js'

export default Fragment((props, content) => {
	let src

	if(props.svg)
		src = toDataURL(props.svg)
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
})

function toDataURL(svg){
	let header = 'data:image/svg+xml,'
	let encoded = encodeURIComponent(svg)
		.replace(/'/g, '%27')
		.replace(/"/g, '%22')

	return header + encoded
}