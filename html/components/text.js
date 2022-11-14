import { Fragment } from '@architekt/render'
import { Element } from '../dom.js'

export default Fragment(({ text }) => {
	Element('span', {class: 'text'}, text)
})