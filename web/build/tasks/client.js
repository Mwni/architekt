import fs from 'fs'
import path from 'path'
import esbuild from 'esbuild'
import { pipeline } from '@architekt/builder'
import template from '../template.js'
import { deriveVariants } from '../variants.js'


export default async ({ config, data, plugins, procedure, watch }) => {
	let commonBundle = await data.commonBundle
	let { rootPath, outputPath } = config
	let finalChunksDir = path.join(outputPath, 'js')
	let finalChunks

	await procedure({
		id: `bundle-client`,
		description: `compiling client bundle`,
		execute: async () => {
			let { mainChunk, asyncChunks, watchFiles } = commonBundle
			let { outputFiles: [ finalBundle ] } = await esbuild.build({
				stdin: {
					contents: template({
						file: 'client.js',
						fields: {
							clientEntry: mainChunk.local
						}
					}),
					sourcefile: 'app-entry.js',
					resolveDir: './'
				},
				plugins: [
					pipeline.resolve({
						isExternal: args => asyncChunks.some(chunk => chunk.local === args.path),
						rootPath,
						yields: {}
					}),
					pipeline.internal({
						[mainChunk.local]: mainChunk.code
					})
				],
				bundle: true,
				format: 'esm',
				write: false,
				logLevel: 'silent'
			})

			console.log(finalBundle.text)
		
			appChunk.local = './app.js'
			appChunk.file = `app${suffix}.js`
			appChunk.code = `${finalBundle.text}\nexport { ${sharedExports.join(', ')} }`

			for(let chunk of asyncChunks){
				let messyName = chunk.file
				let cleanName = `${messyName.slice(9, -12)}.js`

				for(let { local } of sharedChunks){
					chunk.code = chunk.code.replace(local, `/js/app${suffix}.js`)
				}

				appChunk.code = appChunk.code.replace(chunk.local, `/js/${cleanName}`)
				chunk.file = cleanName
			}

			finalChunks = [appChunk, ...asyncChunks]
			watch(watchFiles)
		}
	})

	if(!fs.existsSync(finalChunksDir))
		fs.mkdirSync(finalChunksDir, { recursive: true })

	for(let { bundleSuffix, chunkTransforms } of deriveVariants('js', plugins)){
		let modifiedFinalChunks = structuredClone(finalChunks)

		if(chunkTransforms.length > 0){
			await procedure({
				id: `apply-${bundleSuffix}`,
				description: bundleSuffix
					? `applying transforms for ${bundleSuffix} bundle`
					: `applying plugin transforms`,
				execute: async () => {
					for(let chunk of modifiedFinalChunks){
						for(let transform of chunkTransforms){
							Object.assign(chunk, await transform(chunk))
						}
					}
				}
			})
		}

		for(let chunk of modifiedFinalChunks){
			fs.writeFileSync(
				path.join(finalChunksDir, `${chunk.file.slice(0, -3)}${bundleSuffix}.js`), 
				chunk.code
			)
		}
	}
}
