import bundleStylesheets from './stylesheets.js'


export default async chunk => {
	let bundle = {}

	if(chunk.stylesheets.length > 0){
		bundle.stylesheet = await bundleStylesheets(chunk)
	}

	return Object.keys(bundle).length > 0
		? bundle
		: null
}