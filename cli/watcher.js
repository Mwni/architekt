import fs from 'fs'
import EventEmitter from 'events'
import { FSWatcher } from 'chokidar'
import { info } from './log.js'


const sections = [
	{id: 'js', filter: /\.(xjs|jsx|js|ts|tsx|xts)$/},
	{id: 'css', filter: /\.(css|scss|xcss)$/},
]


export default class extends EventEmitter{
	constructor(){
		super()
		this.watching = {}
		this.timeouts = {}
		this.watcher = new FSWatcher()
		this.watcher.on('raw', (event, path, details) => {
			let section = this.watching[path]

			clearTimeout(this.timeouts[section])

			this.timeouts[section] = setTimeout(() => {
				info(path, 'changed')
				this.emit('change', section)
			}, 100)
		})
	}

	get blank(){
		return Object.keys(this.watching).length === 0
	}

	update(files){
		let added = []
		let removed = []

		for(let section of sections){
			let filtered = files
				.filter(file => section.filter.test(file))
				.filter(file => !file.includes('node_modules'))
				.filter(file => !file.includes('architekt'))
				.filter((file, i, list) => list.indexOf(file) === i)

			for(let file of filtered){
				if(!this.watching[file]){
					this.watcher.add(file)
					this.watching[file] = section.id

					added.push(file)
				}
			}
		}

		if(added.length === 0)
			return

		info(`watching ${added.length} files for changes`)

		/*info('watching files for changes:')

		for(let file of added){
			info(` - ${file}`)
		}

		for(let file of removed){
			info(` x ${file}`)
		}*/
	}
}