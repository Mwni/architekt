import fetch from './fetch.js'

export function get({ path }){
	return async query => {
		let queryString = new URLSearchParams(query).toString()
		let url = `${path}?${queryString}`
		let res = await fetch(url, {
			headers: {
				'Accept': 'application/json',
			}
		})
		let data = await res.json()

		if(!res.ok){
			throw {
				...data,
				statusCode: res.status
			}
		}

		return data
	}
}

export function post({ path }){
	return async payload => {
		let res = await fetch(path, {
			method: 'post',
			body: JSON.stringify(payload),
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			}
		})
		let data = await res.json()

		if(!res.ok){
			throw {
				...data,
				statusCode: res.status
			}
		}

		return data
	}
}

export function upload({ path }){
	return async ({ file, onProgress }) => {
		let request = new XMLHttpRequest();

		request.open('POST', path)
		request.setRequestHeader('file-name', file.name)
		request.setRequestHeader('content-type', file.type)
		request.setRequestHeader('accept', 'application/json')
		request.send(file)

		request.upload.addEventListener('progress', evt => {
			onProgress(evt.loaded / evt.total)
		})

		return Object.assign(
			new Promise((resolve, reject) => {
				request.addEventListener('load', evt => {
					resolve(JSON.parse(request.responseText))
				})
			
				request.addEventListener('error', error => {
					reject({
						...JSON.parse(request.responseText),
						statusCode: request.status
					})
				})
			}),
			{
				abort: () => {
					try{ 
						request.abort()
						return true
					}catch{
						return false
					}
				}
			}
		)
	}
}

