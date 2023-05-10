import pa from 'path'

export default opts => ({
	name: 'architekt-virtual',
	setup(build){
		build.onResolve(
			{ 
				filter: /.*/
			}, 
			async ({ path, pluginData, ...args }) => {
				if(pluginData?.skipVirtual)
					return

				let virtual = opts.modules.find(
					v => v.path === path
				)

				if(!virtual)
					return await build.resolve(path, {
						...args,
						pluginData: {
							...pluginData,
							skipVirtual: true
						}
					})

				
			
				return {
					path,
					external: false,
					namespace: 'virtual',
					suffix: '',
					sideEffects: false,
					pluginData
				}
			}
		)

		build.onLoad(
			{
				filter: /.*/, 
				namespace: 'virtual',
			}, 
			async ({ path, pluginData }) => {
				let { code } = opts.modules.find(
					v => v.path === path
				)

				return {
					contents: code,
					loader: 'js',
					resolveDir: pa.dirname(path),
					pluginData: {
						...pluginData,
						resolveOverride: {
							namespace: 'file'
						}
					}
				}
			}
		)
	}
})