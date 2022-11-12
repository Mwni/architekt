import fs from 'fs'
import path from 'path'
import { bundle } from '@architekt/builder'
import { resolveExternals } from '../externals.js'
import { createDevPackage } from '../package.js'
import template from '../template.js'


export default async ({ config, procedure, watch }) => {
	let { platform, rootPath, clientEntry, outputPath, serverPort } = config
	let serverConfig = { port: serverPort }
	let externals

	await procedure({
		id: `bundle-server`,
		description: `creating server runtime`,
		execute: async () => {
			let { mainChunk, watchFiles, bundleMeta } = await bundle({
				platform,
				rootPath,
				splitting: false,
				entry: {
					code: template({
						file: 'server.js',
						fields: { 
							clientEntry, 
							serverConfig: JSON.stringify(serverConfig)
						}
					}),
					file: './server.js'
				}
			})
		
			watch(watchFiles)

			fs.writeFileSync(
				path.join(outputPath, 'server.js'),
				mainChunk.code
			)

			externals = bundleMeta.externals
		}
	})

	await procedure({
		id: `package`,
		description: `writing npm package`,
		execute: async () => {
			if(config.dev){
				await createDevPackage({ rootPath, outputPath })
			}else{
				let dependencies = resolveExternals({
					externals: [
						rootPath, 
						...externals.map(p => path.dirname(p))
					]
				})
			}
		}
	})
}
