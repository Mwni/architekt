import pu from 'path'
import esbuild from 'esbuild'
import { get as template } from '../lib/templates.js'
import resolve from './resolve.js'
import internal from './internal.js'



export default async ({ chunks, blueprint, assets, suffix }) => {
	let appChunk = chunks
		.find(chunk => chunk.file === 'stdin.js')

	let asyncChunks = chunks
		.filter(chunk => 
			appChunk.meta.imports
				.filter(i => i.kind === 'dynamic-import')
				.some(i => pu.basename(i.path) === chunk.file))
	
	let sharedChunks = chunks
			.slice(1)
			.filter(chunk => !asyncChunks.includes(chunk))


	appChunk.local = './app.js'

	
	let { outputFiles: [ finalBundle ] } = await esbuild.build({
		stdin: {
			contents: template(`entry.browser.js`),
			sourcefile: `entry${suffix}.browser.js`,
			resolveDir: blueprint.root
		},
		plugins: [
			resolve({
				internal: args => true,
				external: args => asyncChunks.some(chunk => chunk.local === args.path),
				root: blueprint.root,
				yields: {}
			}),
			internal({
				'./assets.js': `export default ${JSON.stringify(assets)}`,
				...chunks.reduce((o, chunk) => ({...o, [chunk.local]: chunk.code}), {})
			})
		],
		bundle: true,
		format: 'esm',
		write: false,
		logLevel: 'silent'
	})

	let sharedExports = sharedChunks.reduce((e, chunk) => [...e, ...chunk.meta.exports], [])

	appChunk.file = `app${suffix}.js`
	appChunk.code = `${finalBundle.text}\nexport { ${sharedExports.join(', ')} }`

	for(let chunk of asyncChunks){
		let messyName = chunk.file
		let cleanName = `${messyName.slice(9, -12)}.js`

		for(let { local } of sharedChunks){
			chunk.code = chunk.code.replace(local, `/x/app${suffix}.js`)
		}

		appChunk.code = appChunk.code.replace(chunk.local, `/x/${cleanName}`)
		chunk.file = cleanName
	}

	return {
        watch: [],
		chunks: [appChunk, ...asyncChunks]
	}
}

/*
function stage1(){
	let transformMeta = {}
	let { metafile } = await esbuild.build({
		stdin: {
			contents: clientEntry,
			sourcefile: `${varid}.js`,
			resolveDir: ctx.blueprint.root
		},
		plugins: [
			resolve({
				side: 'client',
				root: ctx.blueprint.root,
				sideEffects: false,
				skipExternal: false,
			}),
			transform({
				side: 'client',
				root: ctx.blueprint.root,
				meta: transformMeta,
				blueprint: ctx.blueprint.clientSrc,
				assets: manifest,
			}),
			patch({
				suffix
			}),
			polyfill()
		],
		jsxFactory: '$X',
		jsxFragment: '\'[\'',
		platform: 'browser',
		target: 'es2020',
		treeShaking: true,
		bundle: true,
		splitting: true,
		metafile: true,
		external: ['fs', 'path', 'os'],
		format: 'esm',
		outdir: clientDir,
		logLevel: 'silent'
	})

				
				for(let [path, bundle] of Object.entries(metafile.outputs)){
					bundles.push({path, ...bundle})
				}


				metas[varid] = {
					...metafile,
					transforms: transformMeta,
				}
}
*/