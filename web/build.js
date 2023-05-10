import fs from 'fs-extra'
import path from 'path'
import { loadPlugins, spawnTask } from '@architekt/builder'
import { createDevPackage, createDistPackage } from './lib/package.js'



export default async ({ config, projectPath, outputPath, procedure, watch, dev }) => {
	let [ app ] = await Promise.all(
		[config].map(
			async (config, index) => {
				let [ { clientChunks }, { serverChunks, externals }, { loaderChunks } ] = await Promise.all([
					spawnTask({
						scriptFile: './tasks/client.js',
						id: `client-${index}`,
						args: {
							config,
							projectPath
						}
					}),
					spawnTask({
						scriptFile: './tasks/server.js',
						id: `server-${index}`,
						args: {
							config,
							projectPath
						}
					}),
					spawnTask({
						scriptFile: './tasks/loader.js',
						id: `loader-${index}`,
						args: {
							config,
							projectPath
						}
					})
				])

				return {
					config,
					clientChunks,
					serverChunks,
					loaderChunks,
					externals
				}
			}
		)
	)

	let files = []
	let chunks = [
		...app.loaderChunks,
		...app.clientChunks,
		...app.serverChunks
	]

	if(app.config.plugins){
		let plugins = await loadPlugins(app.config.plugins)

		for(let { name, bundleSuffix, chunkTransforms } of deriveVariants(plugins)){
			if(chunkTransforms.length > 0){
				await procedure({
					description: `applying ${name} transforms`,
					execute: async () => {
						for(let transform of chunkTransforms){
							await transform(chunks)
						}
					}
				})
			}
		}
	}

	for(let chunk of chunks){
		files.push({
			dest: chunk.file,
			content: chunk.code,
		})

		if(chunk.assetBundle){
			files.push({
				dest: `client/${chunk.name}.json`,
				content: JSON.stringify(chunk.assetBundle),
			})
		}

		if(chunk.files)
			files.push(...chunk.files)
	}

	await procedure({
		id: `output`,
		description: `writing files`,
		execute: async () => {
			fs.emptyDirSync(outputPath)

			if(dev){
				await createDevPackage({ projectPath, outputPath })
			}else{
				await createDistPackage({ 
					projectPath, 
					outputPath, 
					externals: app.externals 
				})
			}

			for(let { src, dest, content } of files){
				let absoluteDest = path.join(outputPath, dest)
				let dir = path.dirname(absoluteDest)

				if(!fs.existsSync(dir))
					fs.mkdirSync(dir, { recursive: true })

				if(src){
					fs.copyFileSync(src, absoluteDest)
				}else{
					fs.writeFileSync(absoluteDest, content)
				}
			}
		}
	})

	return {
		
	}
}
