import { Component } from '@architekt/render'
import { Element } from '../dom.js'

export default Component((props, content) => {
	Element('div', {class: 'v-stack'}, content)
})