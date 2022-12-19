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

