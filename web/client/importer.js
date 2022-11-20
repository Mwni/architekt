import { repo as iconRepo } from './icon.js'

export async function importBundle(path){
	return (await Promise.all([
		import(`/app/${path}.js`),
		architektAssets[path] 
			? importAssets(path)
			: null
	]))[0]
}

export async function importAssets(path){
	delete architektAssets[path]

	let res = await fetch(`/app/${path}.json`)
	let { stylesheet, icons } = await res.json()

	if(stylesheet){
		let tag = document.createElement('style')

		tag.textContent = stylesheet

		document.head.appendChild(tag)
	}
	
	if(icons){
		Object.assign(iconRepo, icons)
	}
}