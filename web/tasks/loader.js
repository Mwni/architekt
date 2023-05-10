import { esbuild, loadPlugins } from '@architekt/builder'
import template from '../lib/template.js'
import { reconcileVariants } from '../lib/variants.js'


export default async ({ config, projectPath, procedure }) => {
	let alternativesCode = ''
	let alternatives = config.plugins
		? reconcileVariants(
			await loadPlugins(config.plugins)
		)
		: []

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
							splashScript: config.splashScript, 
							alternatives: alternativesCode
						}
					}),
					sourcefile: `loader.js`,
					resolveDir: projectPath
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