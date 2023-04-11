import { mount } from '@architekt/html'
import { Fragment } from '@architekt/ui'
import { importAssets } from './importer.js'
import Icon, { repo as icons } from './icon.js'
import createPage from './page.js'
import createCookies from './cookies.js'


export default async ({ App }) => {
	if(architektAssets.main){
		await importAssets('main')
	}

	if(window.unloadSplash)
		window.unloadSplash()
	
	mount(
		document.body, 
		Fragment(({ ctx }) => {
			ctx.runtime.components.Icon = Icon

			Object.assign(ctx.runtime, {
				page: createPage(),
				cookies: createCookies(),
				icons
			})
		
			App()
		})
	)
}