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
				let untouched = true
				let state = {
					code, 
					path
				}

				for(let { skip, transform } of opts.transforms){
					if(skip && skip(state))
						continue

					if(transform){
						Object.assign(state, await transform(state))
						untouched = false
					}
				}

				if(untouched)
					return

				let { code: finalCode, ...meta } = state

				opts.emissions.push(meta)

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