import { minify } from 'terser'

export default config => ({
	id: 'minify',
	transformChunks: async chunks => {
		for(let chunk of chunks){
			let { code } = await minify(
				chunk.code, 
				{ sourceMap: false }
			)
			
			chunk.code = code
		}
	}
})