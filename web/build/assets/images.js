import fs from 'fs'
import path from 'path'
import getImageSize from 'image-size'


export default async ({ assets, files }) => {
	let images = {}

	for(let { xid, manifest } of assets){
		let { name, ext } = path.parse(manifest.file)

		if(ext === '.svg'){
			images[xid] = {
				svg: fs.readFileSync(file, 'utf-8')
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

