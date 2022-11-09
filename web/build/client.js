import fs from 'fs'
import path from 'path'
import esbuild from 'esbuild'
import { pipeline } from '@architekt/builder'
import template from './template.js'


export default async ({ config, procedure, data }) => {
	let commonBundle = await data.commonBundle
	let { rootPath, outputPath } = config
	let finalChunksDir = path.join(outputPath, 'browser', 'js')
	let finalChunks

	await procedure({
		id: `bundle-client`,
		description: `compiling client bundle`,
		execute: async () => {
			let { chunks, externals, watch } = commonBundle
			let suffix = ''
			let appChunk = chunks[0]
			let asyncChunks = chunks
				.filter(chunk => 
					appChunk.meta.imports
						.filter(i => i.kind === 'dynamic-import')
						.some(i => path.basename(i.path) === chunk.file))
			
			let sharedChunks = chunks
					.slice(1)
					.filter(chunk => !asyncChunks.includes(chunk))

			let sharedExports = sharedChunks
				.reduce((e, chunk) => [...e, ...chunk.meta.exports], [])
			
			let { outputFiles: [ finalBundle ] } = await esbuild.build({
				stdin: {
					contents: template({
						file: 'client.js',
						fields: {
							clientEntry: appChunk.local
						}
					}),
					sourcefile: 'app.js',
					resolveDir: './'
				},
				plugins: [
					pipeline.resolve({
						isInternal: args => chunks.some(chunk => chunk.local === args.path),
						isExternal: args => asyncChunks.some(chunk => chunk.local === args.path),
						rootPath,
						yields: {}
					}),
					pipeline.internal(
						chunks.reduce(
							(o, chunk) => ({...o, [chunk.local]: chunk.code}), 
							{}
						)
					)
				],
				bundle: true,
				format: 'esm',
				write: false,
				logLevel: 'silent'
			})
		
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
		}
	})

	if(!fs.existsSync(finalChunksDir))
		fs.mkdirSync(finalChunksDir, { recursive: true })

	for(let chunk of finalChunks){
		fs.writeFileSync(path.join(finalChunksDir, chunk.file), chunk.code)
	}
}
