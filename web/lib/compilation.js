
export function extractFunctionCalls(src, functionName){
	let regex = new RegExp('('+functionName+')' + '(.*)(\\{)', 'g')
	let match
	let blocks = []

	while(true){
		match = regex.exec(src)

		if(!match)
			break

		let [start, end] = getBlockBounds(src, match.index + match[0].length - 1)

		start -= match[2].length - 1

		blocks.push({
			start: match.index,
			end: end + 1,
			args: src.slice(start, end)
		})
	}

	return blocks
}


function getBlockBounds(src, start){
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