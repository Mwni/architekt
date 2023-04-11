import { Component } from '@architekt/ui'
import ServerIcon from './icon.js'

export default Component(({ ctx, page, clientApp, cookies }) => {
	ctx.runtime.components.Icon = ServerIcon

	Object.assign(ctx.runtime, {
		isServer: true,
		page,
		cookies,
		icons: {}
	})

	return clientApp
})