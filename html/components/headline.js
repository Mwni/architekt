import { Component } from '@architekt/render'
import { Element } from '../dom.js'

export default Component(({ text }) => {
	Element('h1', {class: 'headline'}, text)
})