import pa from 'path'
import fs from 'fs'
import sass from 'node-sass'

const tags = {
	Root: '.root',
	VStack: '.v-stack',
	HStack: '.h-stack',
	Absolute: '.absolute',
	Headline: '.headline',
	Text: '.text',
	Icon: '.icon',
	Image: '.image',
	Button: '.a-button',
	WebLink: '.weblink',
	Link: '.link',
	TextInput: '.text-input',
	FileInput: '.file-input',
	Canvas: '.a-canvas',

	//SCSS compiler being retarded
	'.textInput': '.text-input'
}

const replacers = Object.entries(tags)
	.map(([from, to]) => ({
		regex: new RegExp(`([^\w])${from}\s*(.|,|:|{)`, `g`),
		repl: `$1${to}$2`
	}))



export default async ({ chunk, watch }) => {
	let { stylesheets } = chunk

	let scss = stylesheets
		.map(({ scss, path, ...props }) => ({ scss: scss || fs.readFileSync(path, 'utf-8'), ...props }))
		.map(({ scss, xid }) => xid ? `.${xid}{\n${scss}\n}` : scss)
		.join('\n\n')

	let includePaths = stylesheets
		.filter(({ path }) => !!path)
		.map(({ path }) => pa.dirname(path))

	let { css, stats } = sass.renderSync({
		data: scss,
		outputStyle: 'compressed',
		includePaths
	})

	for(let { regex, repl } of replacers){
		css = css.toString().replace(regex, repl)
	}
	
	if(stats.includedFiles.length > 0){
		watch(stats.includedFiles)
	}

	return css
}