import { getContext, Component } from '@architekt/ui'
import ServerIcon from './icon.js'

export default Component(({ page, clientApp }) => {
	let { components, downstream } = getContext()

	components.Icon = ServerIcon

	downstream.isServer = true
	downstream.page = page
	downstream.icons = {}

	return clientApp
})