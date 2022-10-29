import { Component } from '@architekt/engine'
import { Element } from '../dom.js'

export default Component(
	() => {

		return ({ text }) => {
			Element('h1', {class: 'a-headline'}, text)
		}
	}
)