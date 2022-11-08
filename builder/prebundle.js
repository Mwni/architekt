import pu from 'path'
import esbuild from 'esbuild'
import { NodeModulesPolyfillPlugin as polyfill } from '@esbuild-plugins/node-modules-polyfill'
import { get as template } from '../lib/templates.js'
import { shouldTreatAsExternal } from '../lib/modules.js'
import resolve from './bundles/resolve.js'
import transform from './bundles/transform.js'
import defaultTransforms from '../transforms/index.js'


export default async ({ blueprint, platform, target }) => {
	let appFileName = `app.${platform}.js`
	let meta = {}
	let ephemeral = Math.random()
		.toString(32)
		.slice(2, 10)
		.padStart(8, 'x')

	let { outputFiles, metafile } = await esbuild.build({
		stdin: {
			contents: template(`app.${platform}.js`),
			sourcefile: appFileName,
			resolveDir: blueprint.root
		},
		plugins: [
			resolve({
				external: platform === 'node' 
					? async args => await shouldTreatAsExternal(args.path, blueprint)
					: false,
				root: blueprint.root,
				yields: meta
			}),
			transform({
				platform,
				pipeline: defaultTransforms,
				root: blueprint.root,
				yields: meta,
			}),
			polyfill()
		],
		loader: {
			'.glsl': 'text',
			'.vert': 'text',
			'.frag': 'text'
		},
		platform,
		target,
		format: 'esm',
		bundle: true,
		metafile: true,
		write: false,
		treeShaking: true,
		splitting: platform === 'browser',
		chunkNames: `${ephemeral}-[name]-[hash]`,
		jsxFactory: `$X`,
		jsxFragment: `'['`,
		logLevel: 'silent',
		outdir: `/`
	})

	let chunks = outputFiles
		.map(f => {
			let file = pu.basename(f.path)
			let local = `./${file}`

			let build = Object.entries(metafile.outputs)
				.find(([path, outputs]) => pu.basename(path) === file)
				[1]

			let transforms = Object.keys(build.inputs)
				.map(src => meta.transforms
					.find(t => pu.resolve(t.path) === pu.resolve(pu.join(blueprint.root, src))))

			let includes = transforms
				.map(transform => transform?.includes)
				.filter(Boolean)
				.reduce((incs, i) => [...incs, ...i], [])
				.map(i => 
					i.startsWith('~')
						? pu.join(blueprint.root, i.slice(1))
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
			.map(path => pu.join(blueprint.root, path)),
	}
}