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

				let isVirtual = opts.modules.some(
					({ name }) => name === path
				)

				if(!isVirtual)
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
					({ name }) => name === path
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