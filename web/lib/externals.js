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

		let packagePath = path.resolve(path.dirname(manifestPath))
		let manifest = JSON.parse(
			fs.readFileSync(manifestPath, 'utf-8')
		)

		if(externalPackages.some(pkg => pkg.packagePath === packagePath))
			continue

		externalPackages.push({
			manifest,
			manifestPath,
			packagePath
		})
	}

	for(let { manifest, packagePath } of externalPackages){
		if(!manifest.dependencies)
			continue

		for(let [name, version] of Object.entries(manifest.dependencies)){
			if(dependencies[name] && dependencies[name].locator) // todo: favor newer version
				continue

			if(!externalPackages.some(pkg => pkg.manifest.name === name))
				continue

			if(version.startsWith('file:') || version.startsWith('.')){
				version = 'file:' + path.resolve(path.join(packagePath, version.replace(/^file:/, '')))
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

	return {
		dependencies,
		packages: externalPackages
	}
}