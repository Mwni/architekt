import fs from 'fs/promises'
import path from 'path'
import { findParentPackageDescriptor } from '../lib/modules.js'
import { repoPath } from '../paths.js'


const nodeInternals = [
	'fs', 
	'path', 
	'os', 
	'url', 
	'http', 
	'tls',
	'child_process',
	'perf_hooks',
	'punycode',
	'vm',
	'tty', 
	'util', 
	'events', 
	'stream', 
	'zlib', 
	'crypto', 
	'string_decoder', 
	'buffer', 
	'querystring', 
	'assert', 
	'net', 
	'https', 
	'async_hooks'
]


export default opts => ({
	name: 'architekt-externals',
	setup(build){
		build.onResolve(
			{ 
				filter: /.*/
			}, 
			async ({ path: f, external, namespace, pluginData, ...args }) => {
				if(pluginData?.skipExternals)
					return

				let xf = f

				if(nodeInternals.includes(f)){
					f = ''
					external = true
				}else{
					let defaultResolve = await build.resolve(f, {
						...args,
						namespace,
						pluginData: {
							...pluginData,
							skipExternals: true
						}
					})

					f = defaultResolve.path
					external = opts.isServer
						? defaultResolve.external
						: false
				}
			
				if(opts.isServer){
					let descriptorPath = await findParentPackageDescriptor(f)
					
					if(descriptorPath){
						let packagePath = path.dirname(descriptorPath)
						let isForeignPackage = packagePath !== opts.rootPath
						let isArchitektPackage = path.resolve(path.join(packagePath, '..')) === repoPath

						if(!isArchitektPackage && isForeignPackage){
							let descriptor = JSON.parse(
								await fs.readFile(descriptorPath, 'utf-8')
							)
							
							if(!descriptor?.architekt?.bundle)
								external = true
						}
					}else{
						external = false
					}
				}


				if(external){
					opts.captures.push(f)
					f = ''
				}

				return {
					path: f,
					external,
					namespace,
					suffix: '',
					sideEffects: false,
					pluginData
				}
			}
		)
	}
})