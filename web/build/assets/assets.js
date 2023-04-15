import fs from 'fs'
import path from 'path'
import getImageSize from 'image-size'


export default async ({ chunk }) => {
	let { assets, files } = chunk
	let images = {}

	for(let { xid, manifest } of assets){
		if(!manifest.file)
			continue

		let { name, ext } = path.parse(manifest.file)

		if(manifest.type === 'svg'){
			images[xid] = {
				type: 'svg',
				svg: fs.readFileSync(manifest.file, 'utf-8'),
				styleKeys: manifest.styleKeys
			}
		}else{
			let { width, height } = getImageSize(manifest.file)

			images[xid] = {
				type: 'image',
				url: `/app/${name}${ext}`,
				width,
				height
			}

			files.push({
				src: manifest.file,
				dest: `./static/${name}${ext}`
			})
		}
	}

	return images
}
