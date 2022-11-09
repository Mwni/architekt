import path from 'path'
import EventEmitter from 'events'
import { pathToFileURL } from 'url'
import { fork } from 'child_process'
import { libRoot } from './paths.js'


const workerPath = path.join(libRoot, 'worker.js')
const workers = []


export default instructions => {
	let handle = new EventEmitter()
	
	if(workers.length === 0){
		spawn(instructions).then(
			() => cycle(instructions, handle)
		)
	}else{
		cycle(instructions, handle)
	}

	return handle
}


async function spawn(instructions){
	let platformLibRoot = path.join(libRoot, '..', instructions.platform, 'build')
	let buildSpecPath = path.join(platformLibRoot, 'index.js')
	let buildSpec = await import(pathToFileURL(buildSpecPath))
	let scripts = [
		...['prebundle'].map(name => path.join(libRoot, 'tasks', `${name}.js`)),
		...buildSpec.tasks.map(({ script }) => path.join(platformLibRoot, script))
	]

	for(let script of scripts){
		workers.push(
			fork(workerPath, [`"${script}"`])
		)
	}

	await Promise.all(
		workers.map(worker => 
			new Promise(resolve => {
				worker.on('message', ({subject, ...payload}) => {
					if(subject === 'ready'){
						worker.removeAllListeners()
						resolve()
					}
				})
			})
		)
	)
}

function cycle(instructions, handle){
	let watch = []
	let data = {}
	let procedures = {}

	for(let worker of workers){
		worker.send({
			subject: 'perform',
			instructions
		})

		worker.on('message', ({subject, ...payload}) => {
			switch(subject){
				case 'procedure':
					if(payload.phase === 'start'){
						let resolve
						let reject
						let promise = new Promise((res, rej) => {
							resolve = res
							reject = rej
						})
						let phandle = {
							...payload.descriptor,
							promise,
							resolve,
							reject
						}

						procedures[payload.descriptor.id] = phandle

						handle.emit('procedure', phandle)
					}else{
						let phandle = procedures[payload.descriptor.id]

						if(payload.phase === 'end')
							phandle.resolve()
						else
							phandle.reject()
					}
					break

				case 'watch':
					watch.push(...payload.files)
					break

				case 'complete':
					Object.assign(data, payload.data)


					for(let worker of workers){
						worker.send({
							subject: 'data',
							data: payload.data
						})
					}

					worker.done = true

					if(workers.every(worker => worker.done)){
						for(let worker of workers){
							worker.done = false
							worker.removeAllListeners()
						}
						
						handle.emit('complete', {
							watch
						})
					}
					break

				case 'error':
					for(let worker of workers){
						worker.done = false
						worker.removeAllListeners()
					}

					setTimeout(
						() => handle.emit('error', payload.error), 
						100
					)

					break
			}
		})
	}
}