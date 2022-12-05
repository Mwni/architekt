import bundleStylesheets from './stylesheets.js'
import bundleImages from './images.js'


export default async chunk => {
	let bundle = {}

	if(chunk.stylesheets.length > 0){
		bundle.stylesheet = await bundleStylesheets(chunk)
	}

	if(chunk.assets.length > 0){
		bundle.images = await bundleImages(chunk)
	}

	return Object.keys(bundle).length > 0
		? bundle
		: null
}