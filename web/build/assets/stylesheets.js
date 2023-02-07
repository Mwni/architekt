import fs from 'fs'
import postcss from 'postcss'
import postcssImport from 'postcss-import'
import postcssUnnest from 'postcss-nested'


const tags = {
	Root: '.a-root',
	VStack: '.a-vstack',
	HStack: '.a-hstack',
	Absolute: '.a-absolute',
	Headline: '.a-headline',
	Text: '.a-text',
	Icon: '.a-icon',
	Image: '.a-image',
	Button: '.a-button',
	WebLink: '.a-weblink',
	Link: '.a-link',
	TextInput: '.a-textinput',
	FileInput: '.a-fileinput',
	Canvas: '.a-canvas',
}

const replacers = Object.entries(tags)
	.map(([from, to]) => ({
		regex: new RegExp(`([^\w])${from}\s*(.|,|:|{)`, `g`),
		repl: `$1${to}$2`
	}))

const postcssScope = ({ xid }) => ({
	postcssPlugin: 'postcss-scope',
	Rule(rule){
		let newSelectors = []

		for(let selector of rule.selectors){
			let tagEndIndex = selector.match(/^(\w|(&\.))+/)?.[0].length

			newSelectors.push(`.${xid} ${selector}`)
			newSelectors.push(
				tagEndIndex
					? selector.slice(0, tagEndIndex) + `.${xid}` + selector.slice(tagEndIndex)
					: `.${xid}${selector}`
			)
		}

		rule.selectors = newSelectors
	}
})


export default async ({ rootPath, plugins, chunk, watch }) => {
	let { stylesheets } = chunk
	let compiledCss = ''

	for(let { content, path, xid } of stylesheets){
		let processor = postcss([
			postcssImport,
			postcssUnnest,
			xid && postcssScope({ xid })
		].filter(Boolean))

		let { css, messages } = await processor.process(
			content || fs.readFileSync(path, 'utf-8'),
			{
				from: path || rootPath,
				map: false
			}
		)

		for(let { regex, repl } of replacers){
			css = css.toString().replace(regex, repl)
		}

		compiledCss += `${css}\n`

		watch(
			messages
				.filter(msg => msg.type === 'dependency')
				.map(msg => msg.file)
		)
	}

	
	return compiledCss
}


/*export default async ({ chunk, watch }) => {
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
		outputStyle: 'expanded',
		includePaths
	})

	for(let { regex, repl } of replacers){
		css = css.toString().replace(regex, repl)
	}
	
	if(stats.includedFiles.length > 0){
		watch(stats.includedFiles)
	}

	return css
}*/