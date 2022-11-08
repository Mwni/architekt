import pu from 'path'
import esbuild from 'esbuild'
import { NodeModulesPolyfillPlugin as polyfill } from '@esbuild-plugins/node-modules-polyfill'
import { shouldTreatAsExternal } from './lib/modules.js'
import resolve from './pipeline/resolve.js'
import transform from './pipeline/transform.js'
import defaultTransforms from './transforms/index.js'


export default async ({ platform, entry, rootPath }) => {
	let entryPoints
	let stdin
	let meta = {}
	let ephemeral = Math.random()
		.toString(32)
		.slice(2, 10)
		.padStart(8, 'x')

	if(entry.code){
		let { dir, base } = pu.parse(entry.file)

		stdin = {
			contents: entry.code,
			sourcefile: base,
			resolveDir: dir
		}
	}else{
		entryPoints = [entry.file]
	}

	let { outputFiles, metafile } = await esbuild.build({
		entryPoints,
		stdin,
		plugins: [
			resolve({
				isExternal: async args => {
					return await shouldTreatAsExternal(args.path, rootPath)
				},
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
		outdir: `/x`
	})

	let chunks = outputFiles
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

	return { 
		chunks,
		externals: meta.externals,
		watch: Object.keys(metafile.inputs)
			.map(path => pu.join(rootPath, path)),
	}
}