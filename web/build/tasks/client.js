import fs from 'fs'
import path from 'path'
import { bundle } from '@architekt/builder'
import template from '../template.js'
import { deriveVariants } from '../variants.js'


export default async ({ config, plugins, procedure, watch }) => {
	let { platform, rootPath, clientEntry, outputPath } = config
	let finalChunksDir = path.join(outputPath, 'js')

	await procedure({
		id: `bundle-client`,
		description: `creating client runtime`,
		execute: async () => {
			let { mainChunk, asyncChunks, watchFiles } = await bundle({
				platform,
				rootPath,
				splitting: true,
				entry: {
					code: template({
						file: 'client.js',
						fields: { clientEntry }
					}),
					file: './client.js'
				}
			})
		
			watch(watchFiles)
		
			if(!fs.existsSync(finalChunksDir))
				fs.mkdirSync(finalChunksDir, { recursive: true })
		
			for(let { bundleSuffix, chunkTransforms } of deriveVariants('js', plugins)){
				let mainChunkMod = structuredClone(mainChunk)
				let asyncChunksMod = structuredClone(asyncChunks)
		
				mainChunkMod.local = './app.js'
				mainChunkMod.file = `app${bundleSuffix}.js`
		
				for(let chunk of asyncChunksMod){
					let dirtyName = chunk.file
					let cleanName = `${dirtyName.slice(9, -12)}.js`

					chunk.file = cleanName
					chunk.dirtyName = dirtyName
					chunk.code = chunk.code.replaceAll(
						'./stdin.js',
						`/js/app${bundleSuffix}.js`
					)
			
					mainChunkMod.code = mainChunkMod.code.replaceAll(
						chunk.local, 
						`/js/${cleanName}`
					)
				}

				for(let c1 of asyncChunksMod){
					for(let c2 of asyncChunksMod){
						if(c1 === c2)
							continue

						c1.code = c1.code.replaceAll(
							`./${c2.dirtyName}`,
							`/js/${c2.file}`
						)
					}
				}
				
				if(chunkTransforms.length > 0){
					await procedure({
						id: `apply-${bundleSuffix}`,
						description: bundleSuffix
							? `applying transforms for ${bundleSuffix} bundle`
							: `applying plugin transforms`,
						execute: async () => {
							for(let chunk of [mainChunkMod, ...asyncChunksMod]){
								for(let transform of chunkTransforms){
									Object.assign(chunk, await transform(chunk))
								}
							}
						}
					})
				}
		
				for(let chunk of [mainChunkMod, ...asyncChunksMod]){
					fs.writeFileSync(
						path.join(finalChunksDir, `${chunk.file.slice(0, -3)}${bundleSuffix}.js`), 
						chunk.code
					)
				}
			}
		}
	})
}
