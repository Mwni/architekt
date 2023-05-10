import { Component } from '@architekt/ui'
import ServerIcon from './icon.js'

export default Component(({ ctx, page, clientApp, clientConfig, cookies }) => {
	ctx.runtime.components.Icon = ServerIcon

	Object.assign(ctx.runtime, {
		isServer: true,
		page,
		cookies,
		assets: {},
		config: clientConfig
	})

	return clientApp
})