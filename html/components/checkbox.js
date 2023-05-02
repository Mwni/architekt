import { Fragment } from '@architekt/ui'
import Element from '../element.js'

export default Fragment(({ ctx, checked, onChange, ...props }) => {
	if(checked === undefined){
		checked = ctx.upstream.optionSelected
	}
	
	Element(
		{
			tag: 'input',
			type: 'checkbox',
			...props,
			class: ['a-checkbox', props.class],
			checked,
			onchange: onChange
		}
	)
})