import path from 'path'
import { isFromPackage } from '../lib/modules.js'
import { repoPath } from '../paths.js'


const nodeInternals = [
	'fs', 
	'path', 
	'os', 
	'url', 
	'http', 
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

					external = defaultResolve.external
					f = defaultResolve.path
				}
			
				let isNative = await isFromPackage({
					filePath: f,
					compare: p => p === opts.rootPath 
						|| path.resolve(path.join(p, '..')) === repoPath
				})

				if(!isNative){
					opts.captures.push(f)
					f = ''
					external = true
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