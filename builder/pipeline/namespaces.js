export default opts => ({
	name: 'architekt-namespaces',
	setup(build){
		build.onResolve(
			{ 
				filter: /.*$/
			},
			async ({ path, pluginData, ...args }) => pluginData?.resolveOverride
				? await build.resolve(
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
				: undefined
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