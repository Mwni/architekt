import fs from 'fs'
import path from 'path'
import { findParentPackageDescriptor } from '@architekt/builder'


export async function resolveExternals({ externals }){
	let dependencies = {}
	let externalPackages = []

	for(let dir of externals){
		let stat = fs.lstatSync(dir)

		if(stat.isSymbolicLink()){
			dir = fs.readlinkSync(dir)
		}

		let manifestPath = path.join(dir, 'package.json')

		if(!fs.existsSync(manifestPath))
			manifestPath = await findParentPackageDescriptor(dir)

		if(!fs.existsSync(manifestPath))
			continue

		let manifest = JSON.parse(
			fs.readFileSync(manifestPath, 'utf-8')
		)

		externalPackages.push({
			manifest,
			manifestPath
		})
	}

	for(let { manifest, manifestPath } of externalPackages){
		let packagePath = path.basename(manifestPath)

		if(!manifest.dependencies)
			continue

		for(let [name, version] of Object.entries(manifest.dependencies)){
			if(dependencies[name] && dependencies[name].locator) // todo: favor newer version
				continue

			if(!externalPackages.some(pkg => pkg.manifest.name === name))
				continue

			if(version.startsWith('file:') || version.startsWith('.')){
				version = 'file:' + path.resolve(path.join(packagePath, version.slice(5)))
			}

			let locator = null

			/* todo: revisit this
			if(fs.existsSync(path.join(modulesPath, name))){
				locator = path.resolve(path.join(modulesPath, name))
			}
			*/

			dependencies[name] = {
				version,
				locator
			}
		}
	}

	return dependencies
}