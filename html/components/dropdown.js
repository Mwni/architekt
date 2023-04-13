import { Fragment } from '@architekt/render'
import Element from '../element.js'

export default Fragment(({ value, options, onChange, ...props }) => {
	return Element(
		{
			tag: 'select',
			...props,
			class: ['a-dropdown', props.class],
			value,
			onchange: onChange
		},
		() => options.map(
			({ value, text }) => Element(
				{
					tag: 'option',
					value,
					textContent: text || value
				}
			)
		)
	)
})