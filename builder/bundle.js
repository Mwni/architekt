import path from 'path'
import esbuild from 'esbuild'
import { NodeModulesPolyfillPlugin as polyfill } from '@esbuild-plugins/node-modules-polyfill'
import namespaces from './pipeline/namespaces.js'
import shorthands from './pipeline/shorthands.js'
import externals from './pipeline/externals.js'
import { stripExports, stripImports } from './lib/code.js'
import stylesheets from './pipeline/stylesheets.js'
import assets from './pipeline/assets.js'
import transforms from './pipeline/transforms.js'
import defaultTransforms from './transforms/index.js'
import { generateXid } from './lib/xid.js'
import apis from './pipeline/apis.js'
import template from './template.js'
import virtual from './pipeline/virtual.js'


export async function bundle({ projectPath, entry, virtuals, importerImpl, isServer }){
	let baseConfig = {}
	let ephemeral = generateXid(8)
	let capturedExternals = []
	let capturedTransforms = []
	let capturedStylesheets = []
	let capturedAssets = []
	let capturedApis = []

	let { dir: entryDir, base: entryFile } = path.parse(entry.file)
	

	if(entry.code){
		baseConfig = {
			stdin: {
				contents: entry.code,
				sourcefile: entryFile,
				resolveDir: entryDir
			}
		}
	}else{
		baseConfig = {
			entryPoints: [entry.file]
		}
	}

	
	let { outputFiles, metafile } = await esbuild.build({
		...baseConfig,
		plugins: [
			...(
				isServer
					? []
					: [polyfill()]
			),
			virtual({
				modules: virtuals || []
			}),
			namespaces(),
			shorthands({
				projectPath
			}),
			stylesheets({
				projectPath,
				emissions: capturedStylesheets
			}),
			assets({
				projectPath,
				emissions: capturedAssets
			}),
			externals({
				isServer,
				projectPath, 
				emissions: capturedExternals
			}),
			apis({
				isServer,
				projectPath,
				emissions: capturedApis
			}),
			transforms({
				projectPath,
				transforms: defaultTransforms,
				emissions: capturedTransforms,
			}),
		],
		inject: [importerImpl],
		platform: isServer ? 'node' : 'browser',
		target: isServer ? 'es2022' : 'es2020',
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

	let chunks = outputFiles
		.map(f => {
			let file = path.basename(f.path)
			let local = `./${file}`

			let build = Object.entries(metafile.outputs)
				.find(([f, _]) => path.basename(f) === file)
				[1]

			let stylesheets = Object.keys(build.inputs)
				.map(src => capturedStylesheets.find(({ path }) => `stylesheet:${path}` === src))
				.filter(Boolean)

			let assets = Object.keys(build.inputs)
				.map(src => capturedAssets.find(({ path }) => [`asset:${path}`, `html:${path}`].includes(src)))
				.filter(Boolean)

			return {
				file,
				local,
				code: f.text,
				stylesheets,
				assets,
				build,
				files: [],
			}
		})

	let mainChunk = chunks[0]
	let asyncChunks = chunks.filter(
		chunk => chunks.some(
			otherChunk => {
				if(chunk === otherChunk)
					return false

				return otherChunk.build.imports
					.filter(i => i.kind === 'dynamic-import')
					.some(i => path.basename(i.path) === chunk.file)
			}
		)
	)
	
	let sharedChunks = chunks
			.slice(1)
			.filter(chunk => !asyncChunks.includes(chunk))

	if(sharedChunks.length > 0){
		mergeSharedChunksIntoMain({ mainChunk, sharedChunks })
		rewriteImportsOfAsyncChunks({ 
			asyncChunks, 
			sharedChunks, 
			vendorFile: mainChunk.local 
		})
	}

	let standaloneChunks = []

	if(capturedApis.length > 0){
		let { outputFiles, metafile } = await esbuild.build({
			stdin: {
				contents: template({
					file: 'apis.js',
					fields: {
						modules: capturedApis.map(
							({ code, path }, i) => ({
								name: `api${i}`,
								path,
								code
							})
						)
					}
				}),
				sourcefile: 'apis.js',
				resolveDir: entryDir
			},
			plugins: [
				namespaces(),
				virtual({
					modules: capturedApis.map(
						({ code, path }, i) => ({
							name: `api${i}`,
							path,
							code
						})
					)
				}),
				externals({
					isServer: true,
					projectPath, 
					emissions: capturedExternals
				}),
			],
			platform: 'node',
			target: 'es2020',
			format: 'esm',
			bundle: true,
			metafile: true,
			write: false,
			treeShaking: true,
			splitting: false,
			logLevel: 'silent',
			outdir: `__temp__`
		})

		standaloneChunks.push({
			type: 'api',
			file: 'apis.js',
			local: './apis.js',
			code: outputFiles[0].text,
			build: metafile.outputs[0],
			files: []
		})
	}
	
	return {
		mainChunk,
		asyncChunks,
		standaloneChunks,
		externals: capturedExternals
			.filter((dir, i, list) => list.indexOf(dir) === i)
			.sort((a, b) => a.length - b.length),
		watchFiles: Object.keys(metafile.inputs)
			.map(f => f.replace(/^[a-zA-Z0-9_-]+:/, ''))
			.map(f => path.resolve(f))
	}
}

function mergeSharedChunksIntoMain({ mainChunk, sharedChunks }){
	let sharedExports = sharedChunks
		.reduce((e, chunk) => [...e, ...chunk.build.exports], [])

	let mergedCode = ``

	for(let chunk of sharedChunks.slice().reverse()){
		mergedCode += stripExports(stripImports(chunk.code))
		mergedCode += `\n`
	}

	mainChunk.code = mergedCode + stripImports(mainChunk.code)
	mainChunk.code += `export { ${sharedExports.join(', ')} };`
}

function rewriteImportsOfAsyncChunks({ asyncChunks, sharedChunks, vendorFile }){
	for(let chunk of asyncChunks){
		for(let { local } of sharedChunks){
			chunk.code = chunk.code.replace(local, vendorFile)
		}
	}
}