import fs from 'fs'
import path from 'path'
import esbuild from 'esbuild'
import template from '../template.js'
import { deriveVariants, reconcileVariants } from '../variants.js'


export default async ({ config, procedure, data, plugins }) => {
	let { rootPath, outputPath, splashScript } = config
	let [ baseVariant ] = deriveVariants('js', plugins)
	let clientDir = path.join(outputPath, 'client')
	let alternatives = reconcileVariants(plugins)
	let alternativesCode = ''

	if(alternatives.length > 0){
		alternativesCode = alternatives
			.map(alternative => {
				return `{
					suffix: '${alternative.bundleSuffix}',
					js: ${+alternative.scopes.js},
					css: ${+alternative.scopes.css},
					test: ${alternative.condition.browserTest}
				}`
			})
			.join(',')
	}

	
	let bootstrapChunk
	let bootstrapDest = path.join(clientDir, 'bootstrap.js')
	let bootstrapCode = template({
		file: 'bootstrap.js',
		fields: {
			splashScript, 
			alternatives: alternativesCode
		}
	})

	await procedure({
		id: `bootstrap`,
		description: `compiling browser bootstrap unit`,
		execute: async () => {
			let { outputFiles } = await esbuild.build({
				stdin: {
					contents: bootstrapCode,
					sourcefile: `bootstrap.js`,
					resolveDir: rootPath
				},
				format: 'iife',
				bundle: true,
				write: false,
				logLevel: 'silent'
			})

			bootstrapChunk = {
				code: outputFiles[0].text
			}
		}
	})

	if(baseVariant.chunkTransforms.length > 0){
		await procedure({
			id: `bootstrap-transforms`,
			description: `applying plugin transforms to bootstrap`,
			execute: async () => {
				for(let transform of baseVariant.chunkTransforms){
					Object.assign(bootstrapChunk, await transform(bootstrapChunk))
				}
			}
		})
	}

	if(!fs.existsSync(clientDir))
		fs.mkdirSync(clientDir, { recursive: true })

	fs.writeFileSync(bootstrapDest, bootstrapChunk.code)
}