import fs from 'fs'
import path from 'path'
import esbuild from 'esbuild'
import { pipeline, isFromPackage } from '@architekt/builder'
import template from '../template.js'
import { libPath } from '../../paths.js'
import { resolveExternals } from '../externals.js'
import { createDevPackage } from '../package.js'


export default async ({ config, data, procedure, watch }) => {
	let commonBundle = await data.commonBundle
	let { rootPath, outputPath } = config
	let meta = {}
	let serverCode
	let serverConfig = {
		port: config.serverPort
	}

	await procedure({
		id: `bundle-server`,
		description: `compiling server bundle`,
		execute: async () => {
			let { chunks, watch: serverWatchFiles } = commonBundle
			let appChunk = chunks[0]
			
			let { outputFiles: [ finalBundle ], metafile } = await esbuild.build({
				stdin: {
					contents: template({
						file: 'server.js',
						fields: {
							clientEntry: appChunk.local,
							serverConfig: JSON.stringify(serverConfig)
						}
					}),
					sourcefile: 'server.js',
					resolveDir: './'
				},
				plugins: [
					pipeline.resolve({
						isInternal: args => chunks.some(chunk => chunk.local === args.path),
						isExternal: async args => {
							let isFromThisLib = await isFromPackage({
								filePath: args.path,
								packagePath: libPath
							})

							if(isFromThisLib)
								return false

							return !await isFromPackage({
								filePath: args.path,
								packagePath: rootPath
							})
						},
						rootPath,
						yields: meta
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
				logLevel: 'silent',
				metafile: true
			})
		
			serverCode = finalBundle.text
			watch(serverWatchFiles)
		}
	})

	fs.writeFileSync(
		path.join(outputPath, 'server.js'),
		serverCode
	)

	await procedure({
		id: `package`,
		description: `writing npm package`,
		execute: async () => {
			let dependencies = resolveExternals({
				externals: [
					rootPath, 
					...meta.externals.map(p => path.dirname(p))
				]
			})

			if(config.dev){
				await createDevPackage({ rootPath, outputPath })
			}
		}
	})
}
