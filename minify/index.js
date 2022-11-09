import { minify } from 'terser'

export default config => ({
	id: 'js-minify',
	js: {
		chunkTransform: async chunk => {
			let { code } = await minify(
				chunk.code, 
				{ sourceMap: false }
			)
			
			return { code }
		}
	}
})