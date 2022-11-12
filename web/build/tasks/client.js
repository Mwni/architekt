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
					let messyName = chunk.file
					let cleanName = `${messyName.slice(9, -12)}.js`
			
					chunk.file = cleanName
					chunk.code = chunk.code.replace(
						mainChunkMod.local, 
						`/js/app${bundleSuffix}.js`
					)
			
					mainChunkMod.code = mainChunkMod.code.replace(
						chunk.local, 
						`/js/${cleanName}`
					)
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
