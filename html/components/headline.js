import { Fragment } from '@architekt/render'
import Element from '../element.js'

export default Fragment(({ text, tier, ...props }) => Element(
		{
			...props,
			tag: `h${tier || 1}`,
			class: ['a-headline', props.class],
			textContent: text
		}
	)
)