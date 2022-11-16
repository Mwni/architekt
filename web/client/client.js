import { mount } from '@architekt/html'
import { importAssets } from './importer.js'

export default async ({ App }) => {
	if(architektAssets.main){
		await importAssets('main')
	}

	if(window.unloadSplash)
		window.unloadSplash()
	
	mount(document.body, App)
}