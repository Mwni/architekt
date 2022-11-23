import { Fragment } from '@architekt/render'
import { Element } from '../dom.js'

export default Fragment(({ text, tier, class: cls }) => {
	Element(
		`h${tier || 1}`, 
		{
			class: ['headline', cls]
		}, 
		text
	)
})