import { pathToFileURL } from 'url'

const scriptFile = process.argv[2].slice(1, -1)
const { default: scriptFunc } = await import(pathToFileURL(scriptFile))
const cache = {}

let data
let dataCallbacks


async function run(args){
	data = {}
	dataCallbacks = {}

	let ctx = {
		...args,
		cache,
		procedure: async ({ description, execute }) => {
			let result 
			let id = Math.random()
				.toString(16)
				.slice(2)

			await new Promise(resolve => setTimeout(resolve, 10))

			process.send({
				event: 'procedure',
				phase: 'start',
				description,
				id
			})

			try{
				result = await execute()

				process.send({
					event: 'procedure',
					phase: 'end',
					id
				})
			}catch(error){
				process.send({
					event: 'procedure',
					phase: 'fail',
					id
				})

				throw error
			}

			return result
		},
		watch: files => process.send({
			event: 'watch',
			files
		})
	}

	try{
		let data = await scriptFunc(ctx)

		process.send({
			event: 'result',
			data
		})
	}catch(error){
		process.send({
			event: 'error',
			error: formatError(error)
		})
	}
}


function formatError(e){
	if(e.id){
		let text = `file: ${e.id}\n`

		text += '\n'
		text += e.stack
			.split('\n')
			.filter(line => !line.match(/^\s*at/))
			.map((line, i) => (i === 0 ? '   > ' : '   ') + line)
			.join('\n')
			
		text += '\n'

		return text
	}else{
		let text = e.stack
			.split('\n')
			.map((line, i) => (i === 0 ? ' > ' : '   ') + line)
			.join('\n')

		text += '\n'

		if(e.frame){
			text += e.frame
				.split('\n')
				.map(line => '  ' + line)
				.join('\n')
		}

		return text
	}
}


process.on('message', ({ command, ...payload }) => {
	if(command === 'run'){
		run(payload.args)
	}
})