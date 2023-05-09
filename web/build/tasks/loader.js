import { esbuild } from '@architekt/builder'
import template from '../lib/template.js'
import { reconcileVariants } from '../lib/variants.js'


export default async ({ config, procedure, plugins }) => {
	let { rootPath, splashScript } = config
	let alternatives = reconcileVariants(plugins)
	let alternativesCode = ''

	if(alternatives.length > 0){
		alternativesCode = alternatives
			.map(alternative => {
				return `{
					suffix: '${alternative.bundleSuffix}',
					js: ${+alternative.scopes.js},
					css: ${+alternative.scopes.css},
					test: ${alternative.condition.browserTest}
				}`
			})
			.join(',')
	}

	
	let loaderChunks = []

	await procedure({
		id: `loader`,
		description: `building browser loader`,
		execute: async () => {
			let { outputFiles } = await esbuild.build({
				stdin: {
					contents: template({
						file: 'loader.js',
						fields: {
							splashScript, 
							alternatives: alternativesCode
						}
					}),
					sourcefile: `loader.js`,
					resolveDir: rootPath
				},
				format: 'iife',
				bundle: true,
				write: false,
				logLevel: 'silent'
			})

			loaderChunks.push({
				file: 'client/loader.js',
				code: outputFiles[0].text
			})
		}
	})

	return { loaderChunks }
}