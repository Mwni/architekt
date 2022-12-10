import { getContext, Component, Image } from '@architekt/ui'
import { Element } from '@architekt/html'

export const repo = {}

export default Component(({ asset }) => {
	let { node, teardown, afterDraw } = getContext()
	
	Object.assign(asset, repo[asset.xid])

	afterDraw(() => {
		let img = node.children[0].dom
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
			return teardown()

		Element('img', { class: ['icon', props.class] })
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

/*
const x = {
	view: node => {
		let { asset, src, ...attrs } = node.attrs
		let def = node.assets.get('icon', asset)

		if(!def)
			def = {variants: [{url: src}]}

		if(attrs.class)
			attrs.class = `x-icon ${attrs.class}`
		else
			attrs.class = 'x-icon'

		if(def.variants[0].type === 'svg'){
			return X(SVG, {
				...attrs,
				asset: def
			})
		}else{
			return X('img', {
				...attrs,
				src: def.variants[0].url
			})
		}
	}
}

const SVG = node => {
	let { asset: icon } = node.attrs
	let state = {}
	let variant = icon.variants[0]
	let svg = null
	let css


	async function sync({ dom, attrs }){
		if(!dom)
			return

		let css = window.getComputedStyle(dom)

		variant = icon.pick(css)

		dom.width = variant.width
		dom.height = variant.height

		if(!state || state.url !== variant.url || different(variant, css)){
			state = {url: variant.url}

			dom.src = generatePlaceholder(variant)
			dom.style.visibility = 'hidden'
			
			try{
				let svg = await icon.load(variant)

				if(variant.monochrome && !attrs.multicolor){
					svg = svg.replace(/#[0-9A-Fa-f]{6}/g, css.color)
					svg = svg.replace(/#[0-9A-Fa-f]{3}/g, css.color)
					state.color = css.color
				}

				dom.src = toDataURL(svg)
				dom.onload = e => e.target.style.visibility = ''
			}catch{
				console.warn(`could not load icon "${icon.id}"`)
			}
		}
	}

	function different(variant, css){
		if(variant.monochrome){
			if(state.color !== css.color)
				return true
		}
	}

	return {
		oncreate: x => {
			sync(x)
		},
		onupdate: x => {
			sync(x)
		},
		view: x => {
			let { asset, ...attrs } = x.attrs

			sync(x)

			return X('img', {
				...attrs,
				width: variant.width,
				height: variant.height
			})
		}
	}
}

function generatePlaceholder({width, height}){
  return toDataURL(`<svg width="${width}" height="${height}"></svg>`)
}

function toDataURL(svg){
	let header = 'data:image/svg+xml,'
	let encoded = encodeURIComponent(svg)
		.replace(/'/g, '%27')
		.replace(/"/g, '%22')

	return header + encoded
}*/