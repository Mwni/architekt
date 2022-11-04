import { Component } from '@architekt/engine'
import { Element } from '../dom.js'

export default Component(
	() => {

		return ({ gap, content }) => {
			Element('div', {class: 'a-vstack'}, content)
		}
	},
	{tag: 'vstack'}
)