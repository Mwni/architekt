import pu from 'path'
import esbuild from 'esbuild'
import { get as template } from '../lib/templates.js'
import { shouldTreatAsExternal } from '../lib/modules.js'
import resolve from './resolve.js'
import internal from './internal.js'



export default async ({ chunks, blueprint, assets }) => {
    let meta = {}
    let serverChunk = chunks[0]
	let internals = {
		'./assets.js': template('json.js', {json: JSON.stringify(assets)}),
		'./server.js': serverChunk.code,
		'./apis.js': template('apis.server.js', {
			apis: serverChunk.meta.apis
		}),
		...serverChunk.meta.apis
			.reduce((map, api) => ({...map, [`./${api.id}.api.js`]: {
				code: api.serverCode,
				dir: api.resolveDir
			}}), {})
	}


	let { outputFiles: [ finalBundle ] } = await esbuild.build({
		stdin: {
			contents: template(`entry.node.js`),
			sourcefile: `entry.node.js`,
			resolveDir: blueprint.root
		},
		plugins: [
			resolve({
				internal: args => !!internals[args.path],
				external: async args => !internals[args.path] 
					&& await shouldTreatAsExternal(args.path, blueprint),
				root: blueprint.root,
				yields: meta
			}),
			internal(internals)
		],
		bundle: true,
		format: 'esm',
		write: false,
		logLevel: 'silent'
	})

    serverChunk.code = finalBundle.text
	

	return {
        watch: [],
		chunks: [serverChunk],
        externals: meta.externals
	}
}