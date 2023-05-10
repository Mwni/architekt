import fs from 'fs-extra'
import path from 'path'
import { resolveExternals } from './externals.js'


export async function createDistPackage({ projectPath, outputPath, externals }){
	let projectDescriptor = JSON.parse(
		fs.readFileSync(
			path.join(projectPath, 'package.json')
		)
	)

	let resolvedExternals = await resolveExternals({
		externals: [
			projectPath, 
			...externals.map(p => path.dirname(p))
		]
	})

	let dependencies = {}
	let dependenciesList = Object.entries(resolvedExternals)
		.map(([name, meta]) => [name, meta.version])

	for(let [name, locator] of dependenciesList){
		if(!locator)
			continue

		if(locator.startsWith('file:') || locator.startsWith('.')){
			let dir = locator.replace(/^file:/, '')
			let pkname = name//path.basename(dir)
			let copydest = path.join(outputPath, 'libs', pkname)
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
							let dir = path.resolve(
								path.join(path.dirname(dest), loc.replace(/^file:/, ''))
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
			start: 'node server.js'
		},
		dependencies
	}

	fs.writeFileSync(
		path.join(outputPath, 'package.json'), 
		JSON.stringify(descriptor, null, 4)
	)
}


export function createDevPackage({ projectPath, outputPath }){
	let descriptorSrc = path.join(projectPath, 'package.json')
	let descriptorDest = path.join(outputPath, 'package.json')
	let modulesSrc = path.join(projectPath, 'node_modules')
	let modulesDest = path.join(outputPath, 'node_modules')

	fs.copyFileSync(descriptorSrc, descriptorDest)

	if(!fs.existsSync(modulesDest))
		fs.symlinkSync(modulesSrc, modulesDest, 'junction')
}