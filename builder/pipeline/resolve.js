import pu from 'path'


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


export default opts => {
    opts.yields.externals = []

	return {
		name: 'architekt-resolve',
		setup(build){
			build.onResolve({ filter: /.*/ }, async ({ path, external, namespace, pluginData, ...meta }) => {
				if(pluginData?.skipResolver && pluginData.skipResolver.includes('architekt-resolve'))
					return

				if(path.startsWith('~')){
					path = pu.resolve(pu.join(opts.rootPath, path.slice(1)))
				}

				if(namespace === 'internal' && !meta.resolveDir)
					meta.resolveDir = opts.rootPath

				if(opts.isInternal && await opts.isInternal({path})){
					namespace = 'internal'
				}else{
					namespace = 'file'
				}

				if(namespace === 'file'){
					if(nodeInternals.includes(path)){
						path = ''
						external = true
					}else{
						let defaultResolve = await build.resolve(path, {
							...meta,
							namespace,
							pluginData: {
								skipResolver: ['architekt-resolve']
							}
						})
	
						external = defaultResolve.external
						path = defaultResolve.path
					}
				}


				if(opts.isExternal && await opts.isExternal({path})){
					opts.yields.externals.push(path)
					path = ''
					external = true
				}

				return {
					path,
					external,
					namespace,
					suffix: '',
					sideEffects: false
				}
			})
		}
	}
}