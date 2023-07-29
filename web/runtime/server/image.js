import { Component, Image } from '@architekt/ui'
import { Element } from '@architekt/html'


export default Component(({ }) => {
	return props => {
		Element({
			tag: 'img',
			class: ['a-image', props.class]
		})
	}
})