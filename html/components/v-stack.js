import { Component } from '@architekt/engine'
import { Element } from '../dom.js'

export default Component((props, content) => {
	Element('div', {class: 'v-stack'}, content)
})