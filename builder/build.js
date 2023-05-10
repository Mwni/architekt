import path from 'path'
import EventEmitter from 'events'
import { pathToFileURL } from 'url'
import { fork } from 'child_process'
import { libPath } from './paths.js'


let workerPath = path.join(libPath, 'worker.js')
let workers = {}
let platformBuild
let ctx


export function build({ config, platform, projectPath, outputPath, dev }){
	ctx = {
		handle: new EventEmitter(),
		platform,
		projectPath,
		outputPath,
		procedures: {},
		watchFiles: []
	}

	;(async () => {
		if(!platformBuild){
			platformBuild = (
				await import(
					pathToFileURL(
						path.join(
							libPath, 
							'..', 
							platform, 
							'build.js'
						)
					)
				)
			).default
		}
	
		try{
			let result = await platformBuild({
				config,
				projectPath,
				outputPath,
				dev,
				watch: files => ctx.handle.emit('watch', files),
				procedure: ({ description, execute }) => {
					let promise = execute()

					ctx.handle.emit('procedure', {
						description,
						promise
					})

					return promise
				}
			})

			ctx.handle.emit('complete', {
				...result,
				watchFiles: ctx.watchFiles
			})
		}catch(error){
			ctx.handle.emit('error', error)
		}
	})()

	return ctx.handle
}

export async function spawnTask({ scriptFile, args, id }){
	let worker = workers[id]
	
	if(!worker){
		let scriptPath = path.join(
			libPath, 
			'..', 
			ctx.platform, 
			scriptFile
		)

		worker = workers[id] = fork(
			workerPath, 
			[`"${scriptPath}"`],
			{
				stdio: 'pipe'
			}
		)
	}

	worker.on('message', ({ event, ...payload }) => {
		if(event === 'procedure'){
			if(payload.phase === 'start'){
				let resolve
				let reject
				let promise = new Promise((res, rej) => {
					resolve = res
					reject = rej
				})
				let handle = {
					id: payload.id,
					description: payload.description,
					promise,
					resolve,
					reject
				}

				ctx.procedures[payload.id] = handle
				ctx.handle.emit('procedure', handle)
			}else{
				let handle = ctx.procedures[payload.id]

				if(payload.phase === 'end')
					handle.resolve()
				else
					handle.reject()
			}
		}else if(event === 'watch'){
			ctx.watchFiles.push(...payload.files)
		}
	})

	worker.stdout.on('data', data => {
		ctx.handle.emit('print', { 
			module: path.basename(scriptFile),
			text: data.toString() 
		})
	})

	worker.stderr.on('data', data => {
		ctx.handle.emit('print', {
			module: path.basename(scriptFile),
			text: data.toString(), 
			error: true
		})
	})

	worker.send({
		command: 'run',
		args
	})

	try{
		return await new Promise((resolve, reject) => {
			worker.on('message', ({ event, ...payload }) => {
				if(event === 'result'){
					resolve(payload.data)
				}else if(event === 'error'){
					reject(payload.error)
				}
			})
		})
	}catch(error){
		throw error
	}finally{
		worker.removeAllListeners('message')
		worker.stdout.removeAllListeners('data')
		worker.stderr.removeAllListeners('data')
	}

	
}


async function spawn(instructions){
	let platformLibRoot = path.join(libPath, '..', instructions.platform, 'build')
	let buildSpecPath = path.join(platformLibRoot, 'index.js')
	let buildSpec = await import(pathToFileURL(buildSpecPath))
	let scripts = [
		//...[].map(name => path.join(libRoot, 'tasks', `${name}.js`)),
		...buildSpec.tasks.map(({ script }) => path.join(platformLibRoot, script))
	]

	for(let script of scripts){
		workers.push(
			fork(workerPath, [`"${script}"`], {
				stdio: 'pipe'
			})
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

		worker.stdout.on('data', data => {
			handle.emit('print', { text: data.toString() })
		})

		worker.stderr.on('data', data => {
			handle.emit('print', { text: data.toString(), error: true })
		})
	}
}