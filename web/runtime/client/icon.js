import { Component } from '@architekt/ui'
import { Element } from '@architekt/html'
import { assets } from './assets.js'
import { StaticImage, toSvgUrl } from './image.js'


export default ({ asset, ...props }) => {
	asset = assets[asset.xid]

	if(!asset){
		console.warn('icon component was given invalid asset')
		return
	}

	if(asset.styleKeys?.length > 0){
		return DynamicIcon({ asset, ...props })
	}else{
		return StaticImage({ asset, ...props, archClass: 'a-icon' })
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

			img.src = toSvgUrl(svg)
		})

		Element({ 
			tag: 'img', 
			class: ['a-icon', props.class] 
		})
	}
})