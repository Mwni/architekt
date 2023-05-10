import fs from 'fs-extra'
import path from 'path'
import { deriveVariants } from '../lib/variants.js'
import { createDevPackage, createDistPackage } from '../lib/package.js'


export default async ({ config, plugins, procedure, data }) => {
	let { projectPath, outputPath } = config
	let files = []
	let externals = await data.externals
	let chunks = [
		...await data.loaderChunks,
		...await data.clientChunks,
		...await data.serverChunks,
	]

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

	await procedure({
		id: `output`,
		description: `writing files`,
		execute: async () => {
			fs.emptyDirSync(outputPath)

			if(config.dev){
				await createDevPackage({ projectPath, outputPath })
			}else{
				await createDistPackage({ rootPath, outputPath, externals })
			}

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