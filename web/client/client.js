import { mount } from '@architekt/html'
import { getContext, Component } from '@architekt/ui'
import { importAssets } from './importer.js'
import Icon, { repo as iconRepo } from './icon.js'

export default async ({ App }) => {
	if(architektAssets.main){
		await importAssets('main')
	}

	if(window.unloadSplash)
		window.unloadSplash()
	
	mount(
		document.body, 
		Component(() => {
			let { runtime, downstream } = getContext()
		
			runtime.components.Icon = Icon
			downstream.icons = iconRepo
		
			return App
		})
	)
}