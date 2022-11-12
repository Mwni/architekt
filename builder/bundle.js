import path from 'path'
import esbuild from 'esbuild'
import { NodeModulesPolyfillPlugin as polyfill } from '@esbuild-plugins/node-modules-polyfill'
import { resolve, transform } from './pipeline/index.js'
import { stripExports, stripImports } from './lib/code.js'
import { isFromPackage } from './lib/modules.js'
import { repoPath } from './paths.js'
import defaultTransforms from './transforms/index.js'


export default async function({ platform, rootPath, entry, splitting }){
	let meta = {}
	let ephemeral = Math.random()
		.toString(32)
		.slice(2, 10)
		.padStart(8, 'x')
		.toUpperCase()

	let { dir: entryDir, base: entryFile } = path.parse(entry.file)
	let { outputFiles, metafile } = await esbuild.build({
		stdin: {
			contents: entry.code,
			sourcefile: entryFile,
			resolveDir: entryDir
		},
		plugins: [
			resolve({
				isExternal: async args => !await isFromPackage({
					filePath: args.path,
					compare: p => p === rootPath 
						|| path.resolve(path.join(p, '..')) === repoPath
				}),
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
		splitting,
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

			let transforms = Object.keys(build.inputs)
				.map(src => meta.transforms
					.find(t => path.resolve(t.path) === path.resolve(path.join(rootPath, src))))

			let includes = transforms
				.map(transform => transform?.includes)
				.filter(Boolean)
				.reduce((incs, i) => [...incs, ...i], [])
				.map(i => 
					i.startsWith('~')
						? path.join(rootPath, i.slice(1))
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

	let mainChunk = chunks[0]
	let asyncChunks = chunks.filter(
		chunk => chunks.some(
			otherChunk => {
				if(chunk === otherChunk)
					return false

				return otherChunk.meta.imports
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
		bundleMeta: meta,
		watchFiles: Object.keys(metafile.inputs)
			.map(f => path.join(rootPath, f))
	}
}

function mergeSharedChunksIntoMain({ mainChunk, sharedChunks }){
	let sharedExports = sharedChunks
		.reduce((e, chunk) => [...e, ...chunk.meta.exports], [])

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