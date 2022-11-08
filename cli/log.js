import injectDraft from 'draftlog'

injectDraft(console)


export function info(...args){
	console.log('[\x1b[36marchitekt\x1b[0m]', ...args)
}

export function error(...args){
	let text = args
		.map(e => {
			if(e instanceof Error){
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

			return e
		})
		.join(' ')

	console.error('[\x1b[31marchitekt\x1b[0m]', text)
}

export function timed(description){
	let start = Date.now()
	let successful = undefined
	let txt = () => {
		let t = Date.now() - start
		let ft = t.toLocaleString('en')
		let col = '\x1b[90m'

		if(successful === true)
			col = '\x1b[36m'
		else if(successful === false)
			col = '\x1b[31m'

		return `[\x1b[36marchitekt\x1b[0m] ${description.padEnd(32)} -> ${col}${ft} ms\x1b[0m\r`
	}
	let line = console.draft(txt())
	let interval = setInterval(() => line(txt()), 25)

	return success => {
		clearInterval(interval)
		successful = success
		line(txt())
	}
}