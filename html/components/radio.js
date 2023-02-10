import { Fragment, getContext, Select } from '@architekt/ui'
import { Element } from '../dom.js'

export default Fragment(({ checked, onChange, ...props }) => {
	if(checked === undefined){
		let { node } = getContext()

		while(node){
			let parent = node.parentNode
			
			if(parent?.component === Select){
				checked = node.props.value === parent.props.value
			}

			node = parent
		}
	}
	

	Element(
		'input',
		{
			type: 'radio',
			...props,
			class: ['a-radio', props.class],
			checked,
			onchange: onChange
		}
	)
})