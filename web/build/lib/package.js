import fs from 'fs'
import path from 'path'
import { libPath } from '../../paths.js'



const dist = async ctx => {
	let givenDependencies = await ctx.data.dependencies

	await ctx.procedure(
		{
			id: `package`,
			description: `writing dist package`
		},
		async () => {
			let projectDescriptor = JSON.parse(
				fs.readFileSync(
					pu.join(ctx.blueprint.root, 'package.json')
				)
			)
			let dependencies = {}
			let dependenciesList = Object.entries(givenDependencies)
				.map(([name, meta]) => [name, meta.version])
				.concat([
					['@xjs/core', `file:${pu.resolve(pu.join(root, '..', 'core'))}`],
					['@xjs/web', `file:${pu.resolve(pu.join(root, '..', 'web'))}`],
				])

			for(let [name, locator] of dependenciesList){
				if(!locator)
					continue

				if(locator.startsWith('file:') || locator.startsWith('.')){
					let dir = locator.replace(/^file:/, '')
					let pkname = name//pu.basename(dir)
					let copydest = pu.join(ctx.dest, 'libs', pkname)
					let copiedDescriptors = []

					fs.ensureDirSync(copydest)
					fs.copySync(dir, copydest, {
						filter: (src, dest) => {
							if(src.endsWith('package.json')){
								copiedDescriptors.push({src, dest})
							}

							return !src.includes('.DS_Store') &&
								!src.includes('.git') &&
								!src.includes('node_modules') &&
								!src.includes('package-lock.json')
						}
					})

					locator = `file:libs/${pkname}`

					
					for(let { src, dest } of copiedDescriptors){
						let descriptor = JSON.parse(fs.readFileSync(dest, 'utf-8'))

						for(let deps of [descriptor.dependencies, descriptor.peerDependencies]){
							if(!deps)
								continue

							for(let [p, loc] of Object.entries(deps)){
								if(loc.startsWith('file:') || loc.startsWith('.')){
									let dir = pu.resolve(
										pu.join(pu.dirname(dest), loc.replace(/^file:/, ''))
									)

									for(let [n, oloc] of dependenciesList){
										console.log(dir)
									}
								}
							}
						}
					}
				}

				dependencies[name] = locator
			}

			let descriptor = {
				name: projectDescriptor.name,
				type: 'module',
				version: projectDescriptor.version,
				main: 'server.js',
				scripts: {
					server: 'server.js'
				},
				dependencies
			}

			fs.writeFileSync(
				pu.join(ctx.dest, 'package.json'), 
				JSON.stringify(descriptor, null, 4)
			)
		}
	)
}


export function createDevPackage({ rootPath, outputPath }){
	let descriptorSrc = path.join(rootPath, 'package.json')
	let descriptorDest = path.join(outputPath, 'package.json')
	let modulesSrc = path.join(rootPath, 'node_modules')
	let modulesDest = path.join(outputPath, 'node_modules')

	fs.copyFileSync(descriptorSrc, descriptorDest)

	if(!fs.existsSync(modulesDest))
		fs.symlinkSync(modulesSrc, modulesDest, 'junction')
}