import es2amd from '@buxlabs/es6-to-amd'


export default config => {
	if(config.platform !== 'web')
		return

	return {
		id: 'polyfill-imports',
		bundleSuffix: 'amd',
		js: {
			chunkTransform: ({ code, file }) => {
				let transformed = es2amd(code)

				return {
					code: `def${transformed.slice(6)}`
				}
			}
		},
		condition: {
			browserTest: `function(){return !('noModule' in HTMLScriptElement.prototype)}`
		}
	}
}