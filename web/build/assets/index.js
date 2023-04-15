import bundleStylesheets from './stylesheets.js'
import bundleAssets from './assets.js'


export default async ({ chunk, rootPath, procedure, watch, plugins }) => {
	let bundle = {}

	if(chunk.stylesheets.length > 0){
		bundle.stylesheet = await bundleStylesheets({ 
			rootPath, 
			chunk, 
			procedure,
			watch,
			plugins
		})
	}

	if(chunk.assets.length > 0){
		bundle.assets = await bundleAssets({ chunk, rootPath, watch })
	}

	return Object.keys(bundle).length > 0
		? bundle
		: null
}