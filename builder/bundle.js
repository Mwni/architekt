import path from 'path'
import esbuild from 'esbuild'
import { NodeModulesPolyfillPlugin as polyfill } from '@esbuild-plugins/node-modules-polyfill'
import namespaces from './pipeline/namespaces.js'
import shorthands from './pipeline/shorthands.js'
import externals from './pipeline/externals.js'
import { stripExports, stripImports } from './lib/code.js'
import stylesheets from './pipeline/stylesheets.js'
import icons from './pipeline/icons.js'
import transforms from './pipeline/transforms.js'
import defaultTransforms from './transforms/index.js'
import { generateXid } from './lib/xid.js'


export default async function({ platform, rootPath, entry, importerImpl, pipeline }){
	let ephemeral = generateXid(8)
	let capturedExternals = []
	let capturedTransforms = []
	let capturedStylesheets = []
	let capturedIcons = []

	let { dir: entryDir, base: entryFile } = path.parse(entry.file)
	let { outputFiles, metafile } = await esbuild.build({
		stdin: {
			contents: entry.code,
			sourcefile: entryFile,
			resolveDir: entryDir
		},
		plugins: [
			namespaces(),
			shorthands({
				rootPath
			}),
			stylesheets({
				rootPath,
				captures: capturedStylesheets
			}),
			icons({
				captures: capturedIcons
			}),
			externals({
				rootPath, 
				captures: capturedExternals
			}),
			transforms({
				rootPath,
				platform,
				transforms: defaultTransforms,
				captures: capturedTransforms,
			}),
			polyfill()
		],
		inject: [importerImpl],
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

			let icons = Object.keys(build.inputs)
				.map(src => capturedIcons.find(({ path }) => `icon:${path}` === src))
				.filter(Boolean)

			let transforms = Object.keys(build.inputs)
				.map(src => capturedTransforms
					.find(t => path.resolve(t.path) === path.resolve(path.join(rootPath, src))))

			let apis = transforms
				.map(transform => transform?.apis)
				.filter(Boolean)
				.reduce((apis, i) => [...apis, ...i], [])

			return {
				file,
				local,
				code: f.text,
				stylesheets,
				icons,
				build
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

	return {
		mainChunk,
		asyncChunks,
		externals: capturedExternals
			.filter((dir, i, list) => list.indexOf(dir) === i)
			.sort((a, b) => a.length - b.length),
		watchFiles: Object.keys(metafile.inputs)
			.map(f => path.join(rootPath, f))
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