#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import minimist from 'minimist'
import * as log from './log.js'
import * as dirs from './dirs.js'
import Watcher from './watcher.js'
import { build } from '@architekt/builder'
import { fork } from 'child_process'


const args = minimist(process.argv.slice(2))
const descriptorRaw = fs.readFileSync('package.json', 'utf-8')
const descriptor = JSON.parse(descriptorRaw)
const platforms = descriptor.platforms || {}
const platform = args._[1] || Object.keys(platforms)[0] || 'web'
const config = platforms[platform]

if(!config){
	log.error(`missing "${platform}" configuration in package.json`)
	log.error(`consult the documentation`)
	process.exit(1)
}


switch(args._[0]){
	case 'dev': {
		let watcher = new Watcher()
		let outputPath = dirs.createTemp(process.cwd())

		while(true){
			let startTime = Date.now()
			let timers = []
			let handle = build({
				...config,
				platform,
				rootPath: process.cwd(),
				outputPath,
				dev: true
			})

			handle.on('procedure', procedure => {
				let stop = log.timed(procedure.description)

				timers.push(stop)

				procedure.promise
					.then(() => stop(true))
					.catch(() => stop(false))
					.then(() => timers.splice(timers.indexOf(stop), 1))
			})

			await new Promise(resolve => {
				handle.on('complete', build => {
					let duration = Date.now() - startTime
					let server

					watcher.update(build.watch)

					log.info(`build complete after ${duration.toLocaleString('en')} ms`)
					log.info(`spawning server at ${path.join(outputPath, 'server.js')}`)

					server = fork(path.join(outputPath, 'server.js'))

					watcher.once('change', () => {
						server.kill()
						resolve()
					})
				})

				handle.on('error', error => {
					timers.forEach(stop => stop())
					
					log.error(error)

					if(error.watch)
						watcher.update(error.watch)

					if(!watcher.blank){
						log.info(`waiting for file changes to retry...`)
						watcher.once('change', resolve)
					}else{
						log.error(`error was fatal - cannot watch for changes`)
						process.exit()
					}
				})
			})


			log.info(`=================================`)
			log.info(`rebuilding due to file changes...`)
			log.info(`=================================`)
		}
	}

	case 'clean': {
		let dir = dirs.createTemp(process.cwd())

		log.info(`cleaning dev dir: ${dir}`)

		dirs.clean(dir)

		log.info(`done`)

		break
	}

	default: {
		log.info(`no command specified`)
	}
}