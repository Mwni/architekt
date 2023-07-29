import { Component } from '@architekt/ui'
import ServerImage from './image.js'
import ServerIcon from './icon.js'
import ServerHTML from './html.js'

export default Component(({ ctx, document, page, clientApp, clientConfig, cookies }) => {
	Object.assign(ctx.runtime, {
		isServer: true,
		document,
		page,
		cookies,
		assets: {},
		config: clientConfig
	})

	Object.assign(ctx.runtime.components, {
		Image: ServerImage,
		Icon: ServerIcon,
		HTML: ServerHTML
	})

	return clientApp
})