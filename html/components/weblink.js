import { Fragment } from '@architekt/render'
import { Element } from '../dom.js'

export default Fragment(({ url, external, ...props }, content) => {
	Element(
		'a', 
		{
			...props,
			class: ['weblink', props.class],
			href: url,
			target: external
				? '_blank'
				: undefined
		}, 
		content
	)
})