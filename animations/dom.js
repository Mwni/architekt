export function getElementDocPosition(el) {
	let rect = el.getBoundingClientRect()
	
	return {
		x: rect.left + window.scrollX,
		y: rect.top + window.scrollY
	}
}

export function applyTransform(element, transform){
	let strs = []

	for(let [key, value] of Object.entries(transform)){
		if(key === 'scaleX')
			strs.push(`scaleX(${value})`)
		else if(key === 'scaleY')
			strs.push(`scaleY(${value})`)
	}
	
	element.style.transform = strs.join(' ')
}