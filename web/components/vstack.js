import { Component } from '@architekt/engine'
import Element from '../element.js'

export default Component(
	() => {

		return ({ gap, content }) => {
			Element('div', {class: 'a-vstack'}, content)
		}
	}
)