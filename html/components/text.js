import { Component } from '@architekt/engine'
import { Element } from '../dom.js'

export default Component(
	() => {

		return ({ text }) => {
			Element('span', {class: 'a-text'}, text)
		}
	}
)