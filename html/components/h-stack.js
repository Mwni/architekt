import { Component } from '@architekt/engine'
import { Element } from '../dom.js'

export default Component(({ content }) => {
	Element('div', {class: 'h-stack'}, content)
})