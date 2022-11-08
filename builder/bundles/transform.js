import fs from 'fs/promises'


export default opts => {
	opts.yields.transforms = []

	return {
		name: 'xjs-transform',
		setup: build => {
			build.onLoad(
				{
					namespace: 'file',
					filter: /\.x?js$/, 
				}, 
				async ({ path }) => {
					let code = await fs.readFile(path, 'utf8')
					let state = {code, path, platform: opts.platform}

					for(let { skip, transform } of opts.pipeline){
						if(skip && skip(state))
							continue

						Object.assign(state, await transform(state))
					}

					let { code: finalCode, ...meta } = state

					opts.yields.transforms.push(meta)

					return {
						contents: finalCode,
						loader: 'jsx'
					}
				}
			)
		}
	}
}