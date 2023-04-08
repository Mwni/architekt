import { Fragment } from '@architekt/render'
import { Element } from '../dom.js'

export default Fragment((props, content) => {
	let value
	let max

	if(props.value){
		value = Math.round(props.value * 100)
		max = 100
	}

	Element(
		'progress', 
		{
			...props,
			value,
			max,
			class: ['a-progress', props.class]
		}, 
		content
	)
})