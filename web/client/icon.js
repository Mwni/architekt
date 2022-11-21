import { getContext, Component, Image } from '@architekt/ui'
import { Element } from '@architekt/html'

export const repo = {}

export default Component(({ icon }) => {
	let { node, teardown, afterDraw } = getContext()
	
	Object.assign(icon, repo[icon.xid])

	afterDraw(() => {
		let img = node.children[0].dom
		let multivariant = icon.variants.length > 1

		let style = multivariant || icon.variants[0].replace
			? window.getComputedStyle(img)
			: null

		let { svg, replace } = multivariant
			? pickVariant(icon.variants, style)
			: icon.variants[0]

		if(replace){
			for(let [target, repl] of Object.entries(replace)){
				svg = svg.replaceAll(
					target,
					style.getPropertyValue(repl) || style.getPropertyValue(`--${repl}`)
				)
			}
		}

		img.src = toDataURL(svg)
	})

	return ({ icon: newIcon }) => {
		if(icon.xid !== newIcon.xid)
			return teardown()

		Element('img', { class: 'icon' })
	}
})

function pickVariant(variants, style){
	return variants[0]
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