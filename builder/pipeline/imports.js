import fs from 'fs/promises'


export default opts => ({
	name: 'architekt-async-imports',
	setup: build => {
		build.onLoad(
			{
				namespace: 'file',
				filter: /\.js$/, 
			},
			async ({ path }) => {
				let code = await fs.readFile(path, 'utf8')

				code.replace(
					/([^\w])(import\s*\(\s*("|').*("|')\s*\))/g,
					'$1importBundle($2)'
				)

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
					loader: 'js'
				}
			}
		)
	}
})