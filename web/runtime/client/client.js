import { mount } from '@architekt/html'
import { Fragment } from '@architekt/ui'
import { importAssets } from './importer.js'
import ClientImage from './image.js'
import ClientIcon from './icon.js'
import ClientHTML from './html.js'
import createPage from './page.js'
import createCookies from './cookies.js'
import { assets } from './assets.js'


export default async ({ App }) => {
	if(architektAssets.main){
		await importAssets('main')
	}

	if(window.unloadSplash)
		window.unloadSplash()
	
	mount(
		document.body, 
		Fragment(({ ctx }) => {
			Object.assign(ctx.runtime, {
				document,
				page: createPage(),
				cookies: createCookies(),
				assets,
				config: typeof architektConfig !== 'undefined'
					? architektConfig
					: {}
			})

			Object.assign(ctx.runtime.components, {
				Image: ClientImage,
				Icon: ClientIcon,
				HTML: ClientHTML
			})		
		
			App()
		})
	)
}