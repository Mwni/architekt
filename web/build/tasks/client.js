import fs from 'fs'
import path from 'path'
import { bundle } from '@architekt/builder'
import { deriveVariants } from '../lib/variants.js'
import { libPath } from '../../paths.js'
import template from '../lib/template.js'
import bundleAssets from '../assets/index.js'
import { rewriteImports } from '../lib/imports.js'


export default async ({ config, plugins, procedure, watch }) => {
	let { platform, rootPath, clientEntry, outputPath } = config
	let finalChunksDir = path.join(outputPath, 'client')

	let { mainChunk, asyncChunks, watchFiles } = await procedure({
		id: `build-client`,
		description: `building client app`,
		execute: async () => await bundle({
			platform,
			rootPath,
			entry: {
				code: template({
					file: 'client.js',
					fields: { clientEntry }
				}),
				file: './client.js'
			},
			importerImpl: path.join(
				libPath, 
				'client', 
				'importer.js'
			)
		})
	})

	mainChunk.stylesheets.unshift({
		scss: template({ file: 'defaults.scss' })
	})

	await procedure({
		id: `bundle-client`,
		description: `bundling client assets`,
		execute: async () => {
			for(let chunk of [mainChunk, ...asyncChunks]){
				chunk.assetBundle = await bundleAssets(chunk)
			}
		
			if(!fs.existsSync(finalChunksDir))
				fs.mkdirSync(finalChunksDir, { recursive: true })
		
			for(let { bundleSuffix, chunkTransforms } of deriveVariants('js', plugins)){
				let mainChunkMod = structuredClone(mainChunk)
				let asyncChunksMod = structuredClone(asyncChunks)
				let hasAssets = {}
		
				if(mainChunkMod.assetBundle)
					hasAssets.main = 1

				await rewriteImports({
					mainChunk: mainChunkMod,
					asyncChunks: asyncChunksMod,
					mainPath: `/app/main${bundleSuffix}.js`
				})

				for(let chunk of asyncChunksMod){
					if(chunk.assetBundle)
						hasAssets[chunk.file] = 1
				}

				mainChunkMod.file = `main${bundleSuffix}`
				mainChunkMod.code = `var architektAssets = ${JSON.stringify(hasAssets)}\n\n${mainChunkMod.code}`
				
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
					let fileName = `${chunk.file}${bundleSuffix}`

					fs.writeFileSync(
						path.join(finalChunksDir, `${fileName}.js`), 
						chunk.code
					)

					if(chunk.assetBundle){
						fs.writeFileSync(
							path.join(finalChunksDir, `${fileName}.json`), 
							JSON.stringify(chunk.assetBundle)
						)
					}
				}
			}
		}
	})

	watch(watchFiles)
}
