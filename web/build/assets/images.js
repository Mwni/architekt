import fs from 'fs'
import path from 'path'
import getImageSize from 'image-size'


export default async ({ chunk }) => {
	let { assets, files } = chunk
	let images = {}

	for(let { xid, manifest } of assets){
		let { name, ext } = path.parse(manifest.file)

		if(ext === '.svg'){
			images[xid] = {
				svg: fs.readFileSync(manifest.file, 'utf-8'),
				replace: manifest.replace
			}
		}else{
			let { width, height } = getImageSize(manifest.file)

			images[xid] = {
				url: `/app/${name}${ext}`,
				width,
				height
			}

			files.push({
				src: manifest.file,
				dest: `./${name}${ext}`
			})
		}
	}

	return images
}

