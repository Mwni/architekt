import path from 'path'
import { bundle } from '@architekt/builder'
import { libPath } from '../../paths.js'
import template from '../lib/template.js'
import bundleAssets from '../assets/index.js'
import { rewriteImports } from '../lib/imports.js'


export default async ({ config, plugins, procedure, watch }) => {
	let { platform, rootPath, clientEntry } = config
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
			let hasAssets = {}

			for(let chunk of [mainChunk, ...asyncChunks]){
				chunk.assetBundle = await bundleAssets({ rootPath, chunk, watch })
			}
		
			if(mainChunk.assetBundle)
				hasAssets.main = 1

			await rewriteImports({
				mainChunk,
				asyncChunks,
				mainPath: `/app/main.js`
			})

			for(let chunk of asyncChunks){
				if(chunk.assetBundle)
					hasAssets[chunk.file] = 1

				Object.assign(chunk, {
					name: chunk.file,
					file: `client/${chunk.file}.js`
				})
			}

			Object.assign(mainChunk, {
				code: `var architektAssets = ${JSON.stringify(hasAssets)}\n\n${mainChunk.code}`,
				name: `main`,
				file: `client/main.js`
			})
		}
	})

	watch(watchFiles)

	return {
		clientChunks: [
			mainChunk, 
			...asyncChunks
		]
	}
}
