import { Fragment } from '@architekt/render'
import { Element } from '../dom.js'

export default Fragment(({ text }) => {
	Element('h1', {class: 'headline'}, text)
})