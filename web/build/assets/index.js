import bundleStylesheets from './stylesheets.js'
import bundleImages from './images.js'


export default async ({ chunk, rootPath, watch }) => {
	let bundle = {}

	if(chunk.stylesheets.length > 0){
		bundle.stylesheet = await bundleStylesheets({ chunk, rootPath, watch })
	}

	if(chunk.assets.length > 0){
		bundle.images = await bundleImages({ chunk, rootPath, watch })
	}

	return Object.keys(bundle).length > 0
		? bundle
		: null
}