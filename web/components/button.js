import { Component } from '@architekt/engine'
import { Element } from '../dom.js'

export default Component(
	() => {

		return ({ text, action }, content) => {
			Element(
				'button', 
				{
					class: 'a-button',
					onclick: action
				}, 
				text ? text : content
			)
		}
	}
)