export function extractValue(src, key){
	let match = src.match(new RegExp(`({|,)\\s*${key}\\s*:\\s*(\\{|\\[|\\(|\\w)`))

	if(!match)
		return

	if(match[2] === '{' || match[2] === '['){
		let start = match.index + match[0].length - 1
		return src.slice(start, getBlockBounds(src, start)[1])
	}else{
		let slice = src.slice(match.index + match[0].length - 1)
		let endMatch = slice.match(/,|\}/)

		return slice.slice(0, endMatch.index)
	}
}

export function extractImports(src){
	return src
		.split(/\n|\r\n/g)
		.filter(line => /^import +/g.test(line))
		.join('\n')
}

export function stripImports(src){
	return src.replace(
		/import\s+?(?:(?:(?:[\w*\s{},]*)\s+from\s+?)|)(?:"\.\/[A-Z0-9]+-chunk-[A-Z0-9]+\.js")[\s]*?(?:;|$|)/g,
		''
	)
}

export function stripExports(src){
	return src.replace(
		/export\s*{(.|\n)*};/g,
		''
	)
}


export function extractBlocks(src, locator, includeLocator){
	let regex = new RegExp('('+locator+')' + '(.*)(\\{|\\[)', 'g')
	let match
	let blocks = []

	while(true){
		match = regex.exec(src)

		if(!match)
			break


		let curly = match[3] === '{'
		let [start, end] = getBlockBounds(src, match.index + match[0].length - 1, curly)

		//TODO: INVESTIGATE
		start -= match[2].length

		if(includeLocator)
			start -= match[1].length

		blocks.push(src.slice(start, end))
	}

	return blocks
}


export function getBlockBounds(src, start){
	let braces = 0
	let curly = src.charAt(start) === '{'

	for(let i=start; i<src.length; i++){
		let char = src.charAt(i)

		if(char === (curly ? '{' : '[')){
			braces++
		}else if(char === (curly ? '}' : ']')){
			braces--

			if(braces === 0){
				return [start, i+1]
			}
		}
	}
}