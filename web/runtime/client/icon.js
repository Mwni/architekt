import { Component, Fragment } from '@architekt/ui'
import { Element } from '@architekt/html'
import { assets } from './assets.js'


export default ({ asset, ...props }) => {
	asset = assets[asset.xid]

	if(!asset){
		console.warn('icon component was given invalid asset')
		return
	}

	if(asset.styleKeys?.length > 0){
		return DynamicIcon({ asset, ...props })
	}else{
		return StaticIcon({ asset, ...props })
	}
}

const DynamicIcon = Component(({ ctx, asset }) => {
	if(asset.type !== 'svg')
		throw new Error(`dynamic ${asset.type} asset type not supported`)

	let state = {}

	return ({ asset: newAsset, ...props }) => {
		if(asset.xid !== newAsset.xid)
			return ctx.teardown()

		ctx.afterRender(() => {
			let img = ctx.dom[0]
			let style = window.getComputedStyle(img)
			let unchanged = true
			let svg = asset.svg

			for(let key of asset.styleKeys){
				if(state[key] !== style.getPropertyValue(key)){
					unchanged = false
					break
				}
			}

			if(unchanged)
				return

			for(let key of asset.styleKeys){
				state[key] = style.getPropertyValue(key)
				svg = svg.replaceAll(
					`{{${key}}}`,
					state[key]
				)
			}

			img.src = toDataURL(svg)
		})

		Element({ 
			tag: 'img', 
			class: ['a-icon', props.class] 
		})
	}
})

const StaticIcon = Component(({ ctx, asset }) => {
	if(asset.type === 'svg'){
		return props => Element({ 
			tag: 'img',
			class: ['a-icon', props.class],
			src: toDataURL(asset.svg)
		})
	}else if(asset.type === 'image'){
		let img = new Image(asset.url)

		img.onload = () => {
			ctx.redraw()
		}

		return props => Element({ 
			tag: 'img',
			class: ['a-icon', props.class],
			src: img.complete
				? asset.url
				: generatePlaceholder(asset.width, asset.height)
		})
	}
})

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