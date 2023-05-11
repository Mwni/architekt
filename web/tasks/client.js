import path from 'path'
import { bundle, loadPlugins } from '@architekt/builder'
import { libPath } from '../paths.js'
import template from '../lib/template.js'
import { rewriteImports } from '../lib/imports.js'
import bundleAssets from '../assets/index.js'


export default async ({ config, projectPath, procedure, watch }) => {
	let { mainChunk, asyncChunks, watchFiles } = await procedure({
		description: `building client app`,
		execute: async () => await bundle({
			projectPath,
			entry: {
				code: template({
					file: 'client.js',
					fields: {
						appComponent: config.appComponent
					}
				}),
				file: './client.js'
			},
			importerImpl: path.join(
				libPath, 
				'runtime',
				'client',
				'importer.js'
			)
		})
	})

	mainChunk.stylesheets.unshift({
		content: template({ file: 'defaults.scss' })
	})

	await procedure({
		description: `creating asset bundles`,
		execute: async () => {
			let hasAssets = {}

			for(let chunk of [mainChunk, ...asyncChunks]){
				chunk.assetBundle = await bundleAssets({ 
					projectPath, 
					chunk, 
					procedure,
					watch,
					plugins: config.plugins
						? await loadPlugins({ plugins: config.plugins, projectPath })
						: []
				})
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
