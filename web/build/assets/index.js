import bundleStylesheets from './stylesheets.js'
import bundleIcons from './icons.js'


export default async chunk => {
	let bundle = {}

	if(chunk.stylesheets.length > 0){
		bundle.stylesheet = await bundleStylesheets(chunk)
	}

	if(chunk.icons.length > 0){
		bundle.icons = await bundleIcons(chunk)
	}

	return Object.keys(bundle).length > 0
		? bundle
		: null
}