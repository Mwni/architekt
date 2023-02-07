import fs from 'fs'
import path from 'path'
import { esbuild } from '@architekt/builder'
import template from '../lib/template.js'
import { deriveVariants, reconcileVariants } from '../lib/variants.js'


export default async ({ config, procedure, plugins }) => {
	let { rootPath, outputPath, splashScript } = config
	let [ baseVariant ] = deriveVariants(plugins)
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

	
	let bootstrapChunks = []

	await procedure({
		id: `bootstrap`,
		description: `creating browser bootstrap`,
		execute: async () => {
			let { outputFiles } = await esbuild.build({
				stdin: {
					contents: template({
						file: 'bootstrap.js',
						fields: {
							splashScript, 
							alternatives: alternativesCode
						}
					}),
					sourcefile: `bootstrap.js`,
					resolveDir: rootPath
				},
				format: 'iife',
				bundle: true,
				write: false,
				logLevel: 'silent'
			})

			bootstrapChunks.push({
				file: 'client/bootstrap.js',
				code: outputFiles[0].text
			})
		}
	})

	return { bootstrapChunks }
}