import { Component } from '@architekt/ui'
import ServerIcon from './icon.js'
import ServerHTML from './html.js'

export default Component(({ ctx, document, page, clientApp, clientConfig, cookies }) => {
	ctx.runtime.components.Icon = ServerIcon
	ctx.runtime.components.HTML = ServerHTML

	Object.assign(ctx.runtime, {
		isServer: true,
		document,
		page,
		cookies,
		assets: {},
		config: clientConfig
	})

	return clientApp
})