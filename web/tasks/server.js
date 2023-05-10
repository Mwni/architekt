import path from 'path'
import { bundle } from '@architekt/builder'
import { libPath } from '../paths.js'
import template from '../lib/template.js'
import { rewriteImports } from '../lib/imports.js'


export default async ({ config, projectPath, procedure, watch }) => {
	let { mainChunk, asyncChunks, standaloneChunks, externals, watchFiles } = await procedure({
		description: `building server app`,
		execute: async () => {
			let { mainChunk, asyncChunks, standaloneChunks, externals, watchFiles } = await bundle({
				isServer: true,
				projectPath,
				entry: {
					file: config.server
				},
				virtuals: [
					{
						path: 'app:server',
						code: template({
							file: 'server.js',
							fields: { 
								appComponent: config.appComponent
							}
						})
					}
				],
				importerImpl: path.join(
					libPath, 
					'runtime',
					'server',
					'importer.js'
				)
			})

			await rewriteImports({
				mainChunk,
				asyncChunks,
				mainPath: '../server.js'
			})

			Object.assign(mainChunk, {
				name: 'server',
				file: 'server.js'
			})

			for(let chunk of standaloneChunks){
				chunk.file = 'server/apis.js'
			}

			return { mainChunk, asyncChunks, standaloneChunks, externals, watchFiles }
		}
	})

	watch(watchFiles)

	return {
		externals,
		serverChunks: [
			mainChunk, 
			...asyncChunks, 
			...standaloneChunks
		]
	}
}
