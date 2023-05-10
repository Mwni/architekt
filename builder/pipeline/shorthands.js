import path from 'path'


export default opts => ({
	name: 'architekt-shorthands',
	setup(build){
		build.onResolve(
			{ 
				filter: /^\~.*/,
				namespace: 'file'
			}, 
			async ({ path: p, pluginData, ...args }) => {
				if(pluginData?.skipShorthands)
					return

				return await build.resolve(
					path.resolve(path.join(opts.projectPath, p.slice(1))), 
					{
						...args,
						pluginData: {
							...pluginData,
							skipShorthands: true
						}
					}
				)
			}
		)
	}
})