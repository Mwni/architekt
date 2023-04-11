import { Component } from '@architekt/ui'
import { Element } from '@architekt/html'

export const repo = {}

export default Component(({ ctx, asset }) => {
	Object.assign(asset, repo[asset.xid])

	ctx.afterRender(() => {
		let img = ctx.dom[0]
		let multivariant = asset.variants

		let style = multivariant || asset.replace
			? window.getComputedStyle(img)
			: null

		let icon = multivariant
			? pickVariant(asset.variants, style)
			: asset

		if(icon.svg)
			applySVG(img, icon, style)
		else
			applyRemote(img, icon, style)
	})

	return ({ asset: newAsset, ...props }) => {
		if(asset.xid !== newAsset.xid)
			return ctx.teardown()

		Element({ 
			tag: 'img', 
			class: ['a-icon', props.class] 
		})
	}
})

function pickVariant(variants, style){
	return variants[0]
}

function applySVG(img, icon, style){
	let { svg, replace } = icon

	if(replace){
		for(let [target, repl] of Object.entries(replace)){
			svg = svg.replaceAll(
				target,
				style.getPropertyValue(repl) || style.getPropertyValue(`--${repl}`)
			)
		}
	}

	img.src = toDataURL(svg)
}

function applyRemote(img, icon){
	img.src = generatePlaceholder(icon.width, icon.height)
	img.onload = () => {
		img.src = icon.url
		img.onload = null
	}
}

function generatePlaceholder(width, height){
	return toDataURL(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"></svg>`)
}

function toDataURL(svg){
	let header = 'data:image/svg+xml,'
	let encoded = encodeURIComponent(svg)
		.replace(/'/g, '%27')
		.replace(/"/g, '%22')

	return header + encoded
}