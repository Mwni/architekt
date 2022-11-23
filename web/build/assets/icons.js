import fs from 'fs'


export default async ({ icons }) => {
	let outputIcons = {}

	for(let { xid, manifest } of icons){
		let variants = []

		for(let { file, replace } of manifest.variants){
			let svg = fs.readFileSync(file, 'utf-8')

			variants.push({
				svg,
				replace
			})
		}

		outputIcons[xid] = {
			variants
		}
	}

	return outputIcons
}