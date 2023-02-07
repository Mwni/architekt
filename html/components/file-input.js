import { Fragment } from '@architekt/render'
import { Element } from '../dom.js'

export default Fragment(({ onChange, multiple, ...props }, content) => {
	let xid = Math.random()
		.toString(32)
		.slice(2, 10)

	if(content){
		Element(
			'label', 
			{ 
				class: 'a-fileinput',
				for: xid,
				ondragover: event => {
					event.preventDefault()
				},
				ondragenter: event => {
					event.preventDefault()
				},
				ondrop: event => {
					let input = document.getElementById(xid)

					event.preventDefault()
					input.files = event.dataTransfer.files
					input.dispatchEvent(
						new Event('change')
					)
				}
			}, 
			content
		)
	}

	Element(
		'input', 
		{
			type: 'file',
			multiple,
			...props,
			id: xid,
			class: [
				'a-fileinput', 
				content && 'custom',
				props.class
			],
			onchange: event => onChange(
				multiple
					? event.target.files
					: event.target.files[0]
			)
		}
	)
})