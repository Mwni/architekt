import fs from 'fs'
import path from 'path'


export function resolveExternals({ externals }){
	let dependencies = {}

	externals
		.filter((dir, i, list) => list.indexOf(dir) === i)
		.sort((a, b) => a.length - b.length)
		.forEach(dir => {
			let stat = fs.lstatSync(dir)

			if(stat.isSymbolicLink()){
				dir = fs.readlinkSync(dir)
			}

			let manifestPath = path.join(dir, 'package.json')
			let modulesPath = path.join(dir, 'node_modules')

			if(!fs.existsSync(manifestPath))
				return

			let manifest = JSON.parse(fs.readFileSync(manifestPath))


			if(!manifest.dependencies)
				return

			Object.entries(manifest.dependencies).forEach(([name, version]) => {
				if(dependencies[name] && dependencies[name].locator) // todo: favor newer version
					return

				if(version.startsWith('file:')){
					version = 'file:' + path.resolve(path.join(dir, version.slice(5)))
				}

				let locator = null

				if(fs.existsSync(path.join(modulesPath, name))){
					locator = path.resolve(path.join(modulesPath, name))
				}

				dependencies[name] = {
					version,
					locator
				}
			})
		})

	return dependencies
}