import { getContext, Component } from '@architekt/ui'
import ServerIcon from './icon.js'

export default Component(({ page, clientApp, cookies }) => {
	let { runtime, downstream } = getContext()

	runtime.components.Icon = ServerIcon
	runtime.cookies = cookies

	downstream.isServer = true
	downstream.page = page
	downstream.icons = {}

	return clientApp
})