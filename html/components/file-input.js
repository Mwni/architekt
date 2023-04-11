import { Fragment } from '@architekt/render'
import Element from '../element.js'

export default Fragment(({ ctx, onChange, multiple, ...props }, content) => {
	let xid = Math.random()
		.toString(32)
		.slice(2, 10)

	if(content){
		Element(
			{ 
				tag: 'label',
				class: 'a-fileinput',
				for: xid,
				ondragover: event => {
					event.preventDefault()
					ctx.public({ dropActive: true })
					ctx.redraw()
				},
				ondragenter: event => {
					event.preventDefault()
					ctx.public({ dropActive: true })
					ctx.redraw()
				},
				ondragleave: event => {
					event.preventDefault()
					ctx.public({ dropActive: false })
					ctx.redraw()
				},
				ondrop: event => {
					let input = document.getElementById(xid)

					ctx.public({ dropActive: false })
					ctx.redraw()

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
		{
			tag: 'input',
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