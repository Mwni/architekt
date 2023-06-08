import fs from 'fs'
import path from 'path'
import { JSDOM } from 'jsdom'


export function htmlLoader(filePath){
	let { ext } = path.parse(filePath)
	
	if(ext !== '.html')
		return

	let html = fs.readFileSync(filePath, 'utf-8')
	let dom = new JSDOM(html)
	let tagStrings = []

	for(let tag of dom.window.document.head.children){
		if(tag.tagName === 'LINK'){

			tagStrings.push(tag.outerHTML)
		}else if(tag.tagName === 'META'){
			tagStrings.push(tag.outerHTML)
		}else{
			throw new Error(`unsupported HTML tag "${tag.tagName}" in ${filePath}`)
		}
	}

	return {
		type: 'html',
		html: tagStrings.join('\n')
	}
}