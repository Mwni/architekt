import { Component } from '@architekt/ui'
import { Element } from '@architekt/html'
import { assets } from './assets.js'


export default ({ asset, ...props }) => {
	asset = assets[asset.xid]

	if(!asset){
		console.warn('image component was given invalid asset')
		return
	}

	return StaticImage({ asset, ...props })
}

export const StaticImage = Component(({ ctx, asset, svg, blob, url, archClass = 'a-image' }) => {
	let src

	if(asset){
		if(asset.type === 'svg'){
			src = toSvgUrl(asset.svg)
		}else if(asset.type === 'image'){
			let img = new Image(asset.url)

			if(img.complete){
				src = asset.url
			}else{
				src = generatePlaceholder(asset.width, asset.height)
				img.onload = () => {
					src = asset.url
					ctx.redraw()
				}
			}
		}
	}else if(svg)
		src = toSvgUrl(svg)
	else if(blob)
		src = toBlobUrl(blob)
	else
		src = url

	return ({ asset: newAsset, ...p }) => {
		if(asset !== newAsset || svg !== p.svg || blob !== p.blob || url !== p.url)
			return ctx.teardown()
	
		Element(
			{
				...p,
				tag: 'img',
				class: [archClass, p.class],
				src
			}
		)
	}
})

export function generatePlaceholder(width, height){
	return toDataURL(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"></svg>`)
}

export function toSvgUrl(svg){
	let header = 'data:image/svg+xml,'
	let encoded = encodeURIComponent(svg)
		.replace(/'/g, '%27')
		.replace(/"/g, '%22')

	return header + encoded
}

function toBlobUrl(blob){
	return (window.URL || window.webkitURL).createObjectURL(blob)
}