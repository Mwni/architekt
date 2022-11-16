import fs from 'fs'
import sass from 'node-sass'

const tags = {
	VStack: '.v-stack',
	Text: '.text'
}

const replacers = Object.entries(tags)
	.map(([from, to]) => ({
		regex: new RegExp(`([^\w])${from}\s*(.|,|:|{)`, `g`),
		repl: `$1${to}$2`
	}))



export default async chunk => {
	let scss = chunk.stylesheets
		.map(({ path, xid }) => `.${xid}{\n${fs.readFileSync(path, 'utf-8')}\n}`)
		.join('\n\n')

	for(let { regex, repl } of replacers){
		scss = scss.replace(regex, repl)
	}

	let { css } = sass.renderSync({
		data: scss,
		outputStyle: 'compressed'
	})

	return css.toString()
}