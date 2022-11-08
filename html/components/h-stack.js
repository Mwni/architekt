import { Component } from '@architekt/render'
import { Element } from '../dom.js'

export default Component(({ content }) => {
	Element('div', {class: 'h-stack'}, content)
})