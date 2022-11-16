import fs from 'fs/promises'


export default opts => ({
	name: 'architekt-transforms',
	setup: build => {
		build.onLoad(
			{
				namespace: 'file',
				filter: /\.js$/, 
			}, 
			async ({ path }) => {
				let code = await fs.readFile(path, 'utf8')
				let state = {
					code, 
					path, 
					platform: opts.platform
				}

				for(let { skip, transform } of opts.transforms){
					if(skip && skip(state))
						continue

					if(transform)
						Object.assign(state, await transform(state))
				}

				let { code: finalCode, ...meta } = state

				opts.captures.push(meta)

				return {
					contents: finalCode,
					loader: 'js'
				}
			}
		)

		build.onEnd(
			async result => {
				for(let outputFile of result.outputFiles){
					let state = {
						code: outputFile.text,
						path: outputFile.path
					}

					for(let { postSkip, postTransform } of opts.transforms){
						if(postSkip && postSkip(state))
							continue

						if(postTransform)
							Object.assign(state, await postTransform(state))
					}

					outputFile.contents = Buffer.from(state.code)
				}
			}
		)
	}
})