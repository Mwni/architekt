import fs from 'fs'
import path from 'path'
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
	Progress: '.a-progress',
	Canvas: '.a-canvas',
}

const replacers = Object.entries(tags)
	.map(([from, to]) => ({
		regex: new RegExp(`((^|\\s|\\>|\\+|\\~|\\,)+)${from}(($|\\s|\\>|\\+|\\~|\\,|\\.|\\:|\\[)+)`, `g`),
		repl: `$1${to}$3`
	}))

const postcssTags = {
	postcssPlugin: 'postcss-tags',
	Rule(rule){
		for(let { regex, repl } of replacers){
			rule.selector = rule.selector.replace(regex, repl)
		}
	}
}

const postcssScope = ({ xid }) => ({
	postcssPlugin: 'postcss-scope',
	Rule(rule){
		if(rule.parent?.type === 'atrule' && rule.parent?.name === 'keyframes')
			return

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

const postcssFonts = ({ from, chunk }) => ({
	postcssPlugin: 'postcss-fonts',
	AtRule(rule){
		if(rule.name !== 'font-face')
			return

		for(let node of rule.nodes){
			if(node.type !== 'decl')
				continue

			if(node.prop !== 'src')
				continue

			let src = node.value.match(
				/(?:\s*|,|^)url\s*\(\s*[\'\"](.+?)[\'\"]/
			)?.[1]

			let name = path.basename(src)

			chunk.files.push({
				src: path.join(
					path.dirname(from), 
					src
				),
				dest: `static/${name}`
			})

			node.value = node.value.replace(src, `/app/${name}`)
		}
	}
})


export default async ({ projectPath, plugins, chunk, procedure, watch }) => {
	let { stylesheets } = chunk
	let compiledCss = ''

	for(let { content, path, xid } of stylesheets){
		let processor = postcss([
			postcssImport,
			postcssUnnest,
			postcssTags,
			xid && postcssScope({ xid, chunk }),
			postcssFonts({
				from: path,
				chunk,
			}),
		].filter(Boolean))

		let { css, messages } = await processor.process(
			content || fs.readFileSync(path, 'utf-8'),
			{
				from: path || projectPath,
				map: false
			}
		)

		compiledCss += `${css}\n`

		watch(
			messages
				.filter(msg => msg.type === 'dependency')
				.map(msg => msg.file)
		)
	}

	let postcssPlugins = plugins.reduce(
		(list, plugin) => [
			...list, 
			...(plugin.postcssPlugins || [])
		],
		[]
	)

	if(postcssPlugins.length > 0){
		await procedure({
			id: `stylesheet-plugins`,
			description: `applying ${
				plugins.map(({ id }) => id).join(' + ')
			}`,
			execute: async () => {
				let processor = postcss(
					postcssPlugins.map(
						({ init }) => init({ projectPath, plugins, chunk, watch })
					)
				)
		
				let result = await processor.process(compiledCss, {
					from: projectPath,
					map: false
				})
		
				compiledCss = result.css
			}
		})

		
	}

	
	return compiledCss
}