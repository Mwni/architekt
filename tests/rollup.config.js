import { nodeResolve } from '@rollup/plugin-node-resolve'

export default {
	input: 'basic.js',
	output: {
		file: 'basic.bundle.js',
		format: 'iife'
	},
	plugins: [
		nodeResolve()
	]
}