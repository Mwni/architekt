import fs from 'fs'
import path from 'path'


export default ({ captures }) => ({
	name: 'architekt-icons',
	setup(build){
		build.onLoad(
			{ 
				filter: /.*/,
				namespace: 'icon'
			},
			async ({ path: manifestOrIconPath }) => {
				let xid
				let variants = []
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

				return {
					contents: JSON.stringify({ xid }),
					loader: 'json'
				}
			}
		)
	}
})