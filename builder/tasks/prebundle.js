import pu from 'path'
import esbuild from 'esbuild'
import { NodeModulesPolyfillPlugin as polyfill } from '@esbuild-plugins/node-modules-polyfill'
import { resolve, transform } from '../pipeline/index.js'
import defaultTransforms from '../transforms/index.js'


export default async ({ config, procedure }) => {
	let { platform, clientEntry, rootPath } = config
	let meta = {}
	let chunks
	let ephemeral = Math.random()
		.toString(32)
		.slice(2, 10)
		.padStart(8, 'x')
		.toUpperCase()


	await procedure({
		id: `prebundle`,
		description: `compiling common bundle`,
		execute: async () => {
			let { outputFiles, metafile } = await esbuild.build({
				entryPoints: [clientEntry],
				plugins: [
					resolve({
						isExternal: () => false,
						rootPath,
						yields: meta
					}),
					transform({
						platform,
						pipeline: defaultTransforms,
						rootPath,
						yields: meta,
					}),
					polyfill()
				],
				platform: 'node',
				target: 'es2020',
				format: 'esm',
				bundle: true,
				metafile: true,
				write: false,
				treeShaking: true,
				splitting: true,
				chunkNames: `${ephemeral}-[name]-[hash]`,
				logLevel: 'silent',
				outdir: `__temp__`
			})

			chunks = outputFiles
				.map(f => {
					let file = pu.basename(f.path)
					let local = `./${file}`

					let build = Object.entries(metafile.outputs)
						.find(([path, _]) => pu.basename(path) === file)
						[1]

					let transforms = Object.keys(build.inputs)
						.map(src => meta.transforms
							.find(t => pu.resolve(t.path) === pu.resolve(pu.join(rootPath, src))))

					let includes = transforms
						.map(transform => transform?.includes)
						.filter(Boolean)
						.reduce((incs, i) => [...incs, ...i], [])
						.map(i => 
							i.startsWith('~')
								? pu.join(rootPath, i.slice(1))
								: i
						)

					let apis = transforms
						.map(transform => transform?.apis)
						.filter(Boolean)
						.reduce((apis, i) => [...apis, ...i], [])

					return {
						file,
						local,
						code: f.text,
						meta: {
							...build,
							includes,
							apis
						}
					}
				})

			meta.watch = Object.keys(metafile.inputs)
				.map(path => pu.join(rootPath, path))
		}
	})


	return { 
		commonBundle: {
			chunks,
			externals: meta.externals,
			watch: meta.watch,
		}
	}
}