export default store => ({
	name: 'xjs-internal',
	setup: build => {
		build.onResolve({ filter: /.*/ }, async ({ path, importer, pluginData, ...meta }) => {
			if(pluginData?.skipResolver && pluginData.skipResolver.includes('xjs-internal'))
					return

			if(typeof store[importer] === 'object'){
				return await build.resolve(path, {
					...meta,
					resolveDir: store[importer].dir,
					pluginData: {
						skipResolver: [
							'xjs-resolve',
							'xjs-internal'
						]
					}
				})
			}
		})

		build.onLoad(
			{
				namespace: 'internal',
				filter: /\.*$/, 
			}, 
			async ({ path }) => ({
				contents: typeof store[path] === 'object'
					? store[path].code
					: store[path]
			})
		)
	}
})