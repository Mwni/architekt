import bundleStylesheets from './stylesheets.js'
import bundleAssets from './assets.js'


export default async ({ chunk, projectPath, procedure, watch, plugins }) => {
	let bundle = {}

	if(chunk.stylesheets.length > 0){
		bundle.stylesheet = await bundleStylesheets({ 
			projectPath, 
			chunk, 
			procedure,
			watch,
			plugins
		})
	}

	if(chunk.assets.length > 0){
		bundle.assets = await bundleAssets({ chunk, projectPath, watch })
	}

	return Object.keys(bundle).length > 0
		? bundle
		: null
}