import { Fragment } from '@architekt/render'
import Scroll from './scroll.js'

export default Fragment((props, content) => Scroll(
	{
		...props,
		direction: 'h'
	},
	content
))