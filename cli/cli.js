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

		let rebuildOnKey = exit => {
			process.stdin.setRawMode(true)
			process.stdin.once('data', data => {
				if(data[0] === 3){
					log.info(`closing dev server`)
					process.exit(0)
				}else{
					exit()
				}
			})

			log.info(`press any key to rebuild`)
		}

		while(true){
			let startTime = Date.now()
			let timers = []
			let postBuildTimer
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
					let server
					let duration = Date.now() - startTime
					let exit = () => server.kill() & resolve()

					watcher.update(build.watch)

					log.info(`build complete after ${duration.toLocaleString('en')} ms`)
					log.info(`spawning server at ${path.join(outputPath, 'server.js')}`)

					server = fork(path.join(outputPath, 'server.js'))

					watcher.once('change', exit)

					postBuildTimer = setTimeout(rebuildOnKey, 1000, exit)
				})

				handle.on('error', error => {
					timers.forEach(stop => stop())
					
					log.error(error)

					if(error.watch)
						watcher.update(error.watch)

					if(!watcher.blank){
						log.info(`waiting for file changes to retry...`)
						watcher.once('change', resolve)
						rebuildOnKey(resolve)
					}else{
						log.error(`error was fatal - cannot watch for changes`)
						process.exit()
					}
				})
			})

			process.stdin.setRawMode(false)
			clearTimeout(postBuildTimer)

			log.info(`=================================`)
			log.info(`rebuilding due to file changes...`)
			log.info(`=================================`)
		}
	}

	case 'dist': {
		Object.assign(config, config.dist)

		let timers = []
		let rootPath = process.cwd()
		let outputPath = dirs.ensureDist(rootPath, 'dist')

		dirs.clean(outputPath)

		let startTime = Date.now()
		let handle = build({
			...config,
			platform,
			rootPath: process.cwd(),
			outputPath
		})

		handle.on('procedure', procedure => {
			let stop = log.timed(procedure.description)

			timers.push(stop)

			procedure.promise
				.then(() => stop(true))
				.catch(() => stop(false))
				.then(() => timers.splice(timers.indexOf(stop), 1))
		})

		handle.on('complete', build => {
			let duration = Date.now() - startTime

			log.info(`distribution build complete after ${duration.toLocaleString('en')} ms`)
			process.exit()
		})

		handle.on('error', error => {
			timers.forEach(stop => stop())
			log.error(error)
			process.exit()
		})
		break
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