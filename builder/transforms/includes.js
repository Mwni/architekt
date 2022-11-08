import pu from 'path'

export function transform({ code, path }){
	let includes = []
	let lines = code.split('\n')
	let cleanLines = []

	for(let line of lines){
		let match = line.match(/^\s*include\s+["|'|`](.+)["|'|`]\s*$/)

		if(match)
			includes.push(match[1])
		else
			cleanLines.push(line)
	}

	return {
		code: cleanLines.join('\n'),
		includes: includes
			.map(i => i.startsWith('~')
				? i
				: pu.join(pu.dirname(path), i)
			)
	}
}

export function skip({ path }){
	return !path.endsWith('.xjs')
}