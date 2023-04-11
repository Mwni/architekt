import { Fragment } from '@architekt/render'
import Element from '../element.js'

export default Fragment(({ text, url, external, ...props }, content) => Element(
		{
			...props,
			tag: 'a',
			class: ['a-weblink', props.class],
			href: url,
			textContent: text,
			target: external
				? '_blank'
				: undefined
		}, 
		text ? undefined : content
	)
)