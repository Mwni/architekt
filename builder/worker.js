import { pathToFileURL } from 'url'

const task = process.argv[2].slice(1, -1)
const { default: run } = await import(pathToFileURL(task))
const cache = {}

let data
let dataCallbacks


async function perform(config){
	data = {}
	dataCallbacks = {}

	let ctx = {
		config,
		cache,
		procedure: async (descriptor, executor) => {
			await new Promise(resolve => setTimeout(resolve, 10))

			process.send({
				subject: 'procedure',
				phase: 'start',
				descriptor
			})

			try{
				await executor()

				process.send({
					subject: 'procedure',
					phase: 'end',
					descriptor
				})
			}catch(error){
				process.send({
					subject: 'procedure',
					phase: 'fail',
					descriptor
				})

				throw error
			}
		},
		data: new Proxy(data, {
			get: (_, prop) => {
				if(data[prop])
					return Promise.resolve(data[prop])
				else
					return new Promise(resolve => {
						dataCallbacks[prop] = resolve
					})
			}
		}),
		watch: files => process.send({
			subject: 'watch',
			files
		})
	}

	try{
		let data = await run(ctx) || {}

		await new Promise(resolve => setTimeout(resolve, 10))

		process.send({
			subject: 'complete',
			data
		})
	}catch(error){
		process.send({
			subject: 'error',
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


process.on('message', ({ subject, ...payload }) => {
	switch(subject){
		case 'perform':
			perform(payload.instructions)
			break

		case 'data':
			for(let [key, value] of Object.entries(payload.data)){
				data[key] = value

				if(dataCallbacks[key]){
					dataCallbacks[key](value)
					delete dataCallbacks[key]
				}
			}
			break
	}
})

process.send({subject: 'ready'})