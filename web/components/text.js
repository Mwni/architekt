import { Component } from '@architekt/engine'
import Element from '../element.js'

export default Component(
	() => {

		return ({ text }) => {
			Element('span', {class: 'a-text'}, text)
		}
	}
)