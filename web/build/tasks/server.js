import path from 'path'
import { bundle } from '@architekt/builder'
import { libPath } from '../../paths.js'
import template from '../lib/template.js'
import { rewriteImports } from '../lib/imports.js'


export default async ({ config, procedure, watch }) => {
	let { platform, rootPath, envFile, serverInit, clientEntry, serverPort, serverRender } = config
	let serverConfig = { 
		port: serverPort, 
		render: serverRender === undefined 
			? true 
			: serverRender
	}

	let { mainChunk, asyncChunks, standaloneChunks, externals, watchFiles } = await procedure({
		id: `build-server`,
		description: `building server app`,
		execute: async () => {
			let { mainChunk, asyncChunks, standaloneChunks, externals, watchFiles } = await bundle({
				isServer: true,
				platform,
				rootPath,
				entry: {
					code: template({
						file: 'server.js',
						fields: { 
							clientEntry, 
							serverConfig: JSON.stringify(serverConfig),
							serverInit,
							envFile: envFile && '.env'
						}
					}),
					file: './server.js'
				},
				importerImpl: path.join(
					libPath, 
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
				chunk.file = 'server/functions.js'
			}

			return { mainChunk, asyncChunks, standaloneChunks, externals, watchFiles }
		}
	})

	if(envFile){
		mainChunk.files.push({
			src: path.join(rootPath, envFile),
			dest: '.env'
		})
	}

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
