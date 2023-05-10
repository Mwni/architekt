export async function rewriteImports({ mainChunk, asyncChunks, mainPath }){
	for(let chunk of asyncChunks){
		let dirtyName = chunk.file
		let cleanName = dirtyName.slice(9, -12)

		chunk.file = cleanName
		chunk.dirtyName = dirtyName
		chunk.code = chunk.code.replaceAll(
			'./stdin.js',
			mainPath
		)

		mainChunk.code = mainChunk.code.replaceAll(
			chunk.local, 
			cleanName
		)
	}

	for(let c1 of asyncChunks){
		for(let c2 of asyncChunks){
			if(c1 === c2)
				continue

			c1.code = c1.code.replaceAll(
				`./${c2.dirtyName}`,
				c2.file
			)
		}
	}
}