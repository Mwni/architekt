export function transform({ code }){
	return { 
		code: code.replace(
			/([^\w])(import\s*\(\s*("|').*("|')\s*\))/g,
			'$1importBundle($2)'
		)
	}
}

export function postTransform({ code }){
	return { 
		code: code.replace(
			/([^\w])importBundle\s*\(import\s*\(\s*(("|').*("|'))\s*\)\)/g,
			'$1importBundle($2)'
		)
	}
}