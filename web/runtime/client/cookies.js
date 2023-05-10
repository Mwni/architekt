export default () => ({
	...Object.fromEntries(
		new URLSearchParams(
			document.cookie.replace(/; /g, "&")
		)
	),
	set: ({ key, value, maxAge, expires }) => {
		let parts = [`${key}=${value}`, `path=/`]

		if(maxAge){
			parts.push(`expires=${new Date(Date.now() + maxAge).toGMTString()}`)
		}else if(expires){
			parts.push(`expires=${expires.toGMTString()}`)
		}

		document.cookie = parts.join('; ')
	}
})