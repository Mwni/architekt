export function join(...parts){
	return normalize(
		parts
			.filter(Boolean)
			.reduce((parts, part) => [...parts, ...part.split('/')], [])
			//.filter((part, i, parts) => part !== '*' || i === parts.length - 1)
			.join('/')
	)
}

export function pop(path){
	return normalize(path)
		.split('/')
		.slice(0, -1)
		.join('/')
}

export function normalize(path){
	let stack = []

	for(let part of path.split('/')){
		if(part === '.')
			continue
		else if(part === '..')
			stack.pop()
		else
			stack.push(part)
	}

	return stack
		.join('/')
		.replace(/\/+/g, '/')
		.replace(/\/$/, '')
		.replace(/^$/, '/')
}

export function relate(path, basePath){
	if(path.startsWith('/'))
		return path

	if(path.startsWith('%'))
		return join(basePath, path.slice(1))

	return join(pop(basePath), path)
}

export function match(route, path){
	let params = {}
	let pathSegments = path.split('/').filter(Boolean)
	let routeSegments = route.split('/').filter(Boolean)
	let routeWildcard = routeSegments[routeSegments.length - 1] === '*'

	for(let i=0; i<routeSegments.length; i++){
		let routeSegment = routeSegments[i]
		let pathSegment = pathSegments[i]

		if(routeSegment === '*'){
			if(i === routeSegments.length - 1)
				break
				
			continue
		}

		if(pathSegment && routeSegment.charAt(0) === ':')
			params[routeSegment.slice(1)] = pathSegment
		else if(routeSegment !== pathSegment)
			return
	}

	if(pathSegments.length > routeSegments.length && !routeWildcard)
		return

	return {
		params, 
		unresolved: pathSegments.slice(routeSegments.length),
		wildcard: routeWildcard
	}
}