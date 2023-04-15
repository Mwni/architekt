import { Fragment } from '@architekt/render'
import Element from '../element.js'

export default Fragment(props => {
	let value
	let max

	if(props.value){
		value = Math.round(props.value * 100)
		max = 100
	}

	Element(
		{
			...props,
			tag: 'progress',
			value,
			max,
			class: ['a-progress', props.class]
		}
	)
})