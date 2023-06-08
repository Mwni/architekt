export default opts => ({
	name: 'architekt-namespaces',
	setup(build){
		build.onResolve(
			{ 
				filter: /.*$/
			},
			async ({ path, pluginData, ...args }) => {
				if(pluginData?.resolveOverride){
					if(path.includes('favicons'))
					console.log('override resolve:', path, args, pluginData.resolveOverride)

					return await build.resolve(
						path,
						{
							...args,
							...pluginData?.resolveOverride,
							pluginData: {
								...pluginData,
								resolveOverride: undefined
							}
						}
					)
				}
			}
		)

		build.onResolve(
			{ 
				filter: /^[a-zA-Z0-9\_\-]+:/,
				namespace: 'file'
			}, 
			async ({ path, ...args }) => {
				let index = path.indexOf(':')
				
				return await build.resolve(
					path.slice(index+1), 
					{
						...args,
						namespace: path.slice(0, index)
					}
				)
			}
		)
	}
})