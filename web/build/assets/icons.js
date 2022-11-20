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

/*

				let descriptor = JSON.parse(
					fs.readFileSync(manifestOrIconPath, 'utf-8')
				)

				if(!descriptor.variants){
					descriptor = {
						variants: [descriptor]
					}
				}

				for(let variant of descriptor.variants){
					let { name } = path.parse(variant.file)
					let svg = fs.readFileSync(variant.file, 'utf-8')

					variants.push({
						xid: name,
						svg
					})
				}

				xid = variants[0].xid
				captures.push({
					xid,
					variants,
					path: manifestOrIconPath
				})
				*/