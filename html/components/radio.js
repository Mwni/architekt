import { Fragment, Select } from '@architekt/ui'
import Element from '../element.js'

export default Fragment(({ ctx, checked, onChange, ...props }) => {
	if(checked === undefined){
		checked = ctx.upstream.optionSelected
	}
	

	Element(
		{
			tag: 'input',
			type: 'radio',
			...props,
			class: ['a-radio', props.class],
			checked,
			onchange: onChange
		}
	)
})