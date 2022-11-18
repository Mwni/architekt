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
		.map(({ scss, path, ...props }) => ({ scss: scss || fs.readFileSync(path, 'utf-8'), ...props }))
		.map(({ scss, xid }) => xid ? `.${xid}{\n${scss}\n}` : scss)
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