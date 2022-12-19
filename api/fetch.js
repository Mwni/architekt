const config = {
	urlBase: ''
}

function architektFetch(url, options){
	let combinedUrl = config.urlBase + url

	return fetch(combinedUrl, options)
}

architektFetch.config = newConfig => {
	Object.assign(config, newConfig)
}

export default architektFetch