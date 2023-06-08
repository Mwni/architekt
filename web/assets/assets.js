import fs from 'fs'
import path from 'path'
import getImageSize from 'image-size'
import { JSDOM } from 'jsdom'



const loaders = {
	'.html': htmlLoader,
	'.json': jsonLoader,
	'.svg': svgLoader,
	'*': imageLoader
}


export default async ({ chunk }) => {
	let { assets, files: chunkFiles } = chunk
	let manifest = {}

	for(let { xid, path: file } of assets){
		let { ext } = path.parse(file)
		let { spec, files } = (loaders[ext] || loaders['*'])(file)

		manifest[xid] = spec

		if(files)
			chunkFiles.push(...files)
	}

	return manifest
}


function htmlLoader(file){
	let basePath = path.dirname(file)
	let html = fs.readFileSync(file, 'utf-8')
	let dom = new JSDOM(html)
	let tagStrings = []
	let copyFiles = []

	for(let tag of dom.window.document.head.children){
		if(tag.tagName === 'LINK'){
			let { name, ext } = path.parse(tag.href)

			copyFiles.push({
				src: path.join(basePath, tag.href),
				dest: `./static/${name}${ext}`
			})

			tag.href = `/app/${name}${ext}`
			tagStrings.push(tag.outerHTML)
		}else if(tag.tagName === 'META'){
			tagStrings.push(tag.outerHTML)
		}else{
			throw new Error(`unsupported HTML tag "${tag.tagName}" in ${filePath}`)
		}
	}

	return {
		spec: {
			type: 'html',
			html: tagStrings.join('\n')
		},
		files: copyFiles
	}
}

export function jsonLoader(filePath){
	/*
	let mapFilePath = file => path.resolve(
		path.join(
			path.dirname(manifestOrAssetPath),
			file
		)
	)
	manifest = JSON.parse(
		fs.readFileSync(manifestOrAssetPath, 'utf-8')
	)

	if(manifest.file){
		manifest.file = mapFilePath(manifest.file)
	}else if(manifest.variants){
		for(let key of Object.keys(manifest.variants)){
			manifest.variants[key].file = mapFilePath(manifest.variants[key].file)
		}
	}
	*/
}


function svgLoader(file){
	let svg = fs.readFileSync(file, 'utf-8')
	let templatesRegex = /\{\{([^}]+)\}\}/g
	let result
	let styleKeys = []
	
	while((result = templatesRegex.exec(svg)) !== null){
		styleKeys.push(result[1])
	}

	return {
		spec: {
			type: 'svg',
			svg,
			styleKeys
		}
	}
}

function imageLoader(file){
	let { name, ext } = path.parse(file)
	let { width, height } = getImageSize(file)

	return {
		spec: {
			type: 'image',
			url: `/app/${name}${ext}`,
			width,
			height
		},
		files: [
			{
				src: file,
				dest: `./static/${name}${ext}`
			}
		]
	}
}