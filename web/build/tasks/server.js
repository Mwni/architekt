import fs from 'fs'
import path from 'path'
import { bundle } from '@architekt/builder'
import { libPath } from '../../paths.js'
import { createDevPackage, createDistPackage } from '../lib/package.js'
import template from '../lib/template.js'
import bundleAssets from '../assets/index.js'
import { rewriteImports } from '../lib/imports.js'
import { resolveExternals } from '../lib/externals.js'


export default async ({ config, plugins, procedure, watch }) => {
	let { platform, rootPath, envFile, serverInit, clientEntry, outputPath, serverPort } = config
	let serverConfig = { port: serverPort }
	let chunksDir = path.join(outputPath, 'server')
	let staticDir = path.join(outputPath, 'static')

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
			let assetManifest = {}

			for(let chunk of [mainChunk, ...asyncChunks]){
				chunk.assetBundle = await bundleAssets(chunk)
			}

			await rewriteImports({
				mainChunk,
				asyncChunks,
				mainPath: '../server.js'
			})

			if(!fs.existsSync(chunksDir))
				fs.mkdirSync(chunksDir, { recursive: true })

			if(!fs.existsSync(staticDir))
				fs.mkdirSync(staticDir, { recursive: true })

			if(mainChunk.assetBundle && mainChunk.assetBundle.stylesheet){
				assetManifest.main = {
					stylesheet: '/static/main.css'
				}

				fs.writeFileSync(
					path.join(staticDir, 'main.css'), 
					mainChunk.assetBundle.stylesheet
				)
			}
	
			for(let chunk of asyncChunks){
				fs.writeFileSync(
					path.join(chunksDir, `${chunk.file}.js`), 
					chunk.code
				)

				if(chunk.assetBundle && chunk.assetBundle.stylesheet){
					assetManifest[chunk.file] = {
						stylesheet: `/static/${chunk.file}.css`
					}

					fs.writeFileSync(
						path.join(staticDir, `${chunk.file}.css`), 
						chunk.assetBundle.stylesheet
					)
				}
			}

			for(let chunk of [mainChunk, ...asyncChunks]){
				for(let { src, dest } of chunk.files){
					fs.copyFileSync(
						src,
						path.join(staticDir, dest)
					)
				}
			}

			mainChunk.code = `global.assetManifest = ${JSON.stringify(assetManifest)}\n\n${mainChunk.code}`

			fs.writeFileSync(
				path.join(outputPath, 'server.js'), 
				mainChunk.code
			)

			for(let chunk of standaloneChunks){
				fs.writeFileSync(
					path.join(outputPath, 'functions.js'), 
					chunk.code
				)
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
}
