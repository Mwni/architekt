import { Component } from '@architekt/engine'
import { Element } from '../dom.js'

export default Component(({ text }) => {
	Element('span', {class: 'text'}, text)
})