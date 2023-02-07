import fs from 'fs'
import path from 'path'
import { deriveVariants } from '../lib/variants.js'


export default async ({ config, plugins, procedure, data }) => {
	let { outputPath } = config
	let files = []
	let chunks = [
		...await data.bootstrapChunks,
		...await data.clientChunks,
		...await data.serverChunks,
	]

	for(let chunk of chunks){
		files.push({
			dest: chunk.file,
			content: chunk.code,
		})

		if(chunk.assetBundle){
			files.push({
				dest: `client/${chunk.name}.json`,
				content: JSON.stringify(chunk.assetBundle),
			})
		}

		if(chunk.files)
			files.push(...chunk.files)
	}

	for(let { name, bundleSuffix, chunkTransforms } of deriveVariants(plugins)){
		if(chunkTransforms.length > 0){
			await procedure({
				id: `apply-${bundleSuffix}`,
				description: `applying ${name} transforms`,
				execute: async () => {
					for(let transform of chunkTransforms){
						await transform(chunks)
					}
				}
			})
		}
	}

	await procedure({
		id: `output`,
		description: `writing files`,
		execute: async () => {
			for(let { src, dest, content } of files){
				let absoluteDest = path.join(outputPath, dest)
				let dir = path.dirname(absoluteDest)

				if(!fs.existsSync(dir))
					fs.mkdirSync(dir, { recursive: true })

				if(src){
					fs.copyFileSync(src, absoluteDest)
				}else{
					fs.writeFileSync(absoluteDest, content)
				}
			}
		}
	})
}