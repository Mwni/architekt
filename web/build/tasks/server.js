import path from 'path'
import { bundle } from '@architekt/builder'
import { libPath } from '../../paths.js'
import { createDevPackage, createDistPackage } from '../lib/package.js'
import template from '../lib/template.js'
import bundleAssets from '../assets/index.js'
import { rewriteImports } from '../lib/imports.js'
import { resolveExternals } from '../lib/externals.js'


export default async ({ config, procedure, watch }) => {
	let { platform, rootPath, envFile, serverInit, clientEntry, outputPath, serverPort } = config
	let serverConfig = { port: serverPort }

	let { mainChunk, asyncChunks, standaloneChunks, externals, watchFiles } = await procedure({
		id: `build-server`,
		description: `building server app`,
		execute: async () => await bundle({
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
						envFile
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
	})

	mainChunk.stylesheets.unshift({
		scss: template({ file: 'defaults.scss' })
	})

	await procedure({
		id: `bundle-server`,
		description: `bundling server assets`,
		execute: async () => {
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
		}
	})

	await procedure({
		id: `package`,
		description: `writing npm package`,
		execute: async () => {
			if(config.dev){
				await createDevPackage({ rootPath, outputPath })
			}else{
				let dependencies = await resolveExternals({
					externals: [
						rootPath, 
						...externals.map(p => path.dirname(p))
					]
				})

				await createDistPackage({ rootPath, outputPath, dependencies })
			}
		}
	})

	watch(watchFiles)

	return {
		serverChunks: [
			mainChunk, 
			...asyncChunks, 
			...standaloneChunks
		]
	}
}
