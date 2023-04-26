const config = {
	urlBase: ''
}

function architektFetch(url, options){
	let combinedUrl = config.urlBase + url

	return fetch(combinedUrl, options)
		.catch(error => {
			if(error.message === 'Failed to fetch')
				throw new Error('Network Error')
			else
				throw error
		})
}

architektFetch.config = newConfig => {
	Object.assign(config, newConfig)
}

export default architektFetch