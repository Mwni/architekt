import fs from 'fs'
import path from 'path'
import { generateXid } from '../lib/xid.js'


export default ({ captures }) => ({
	name: 'architekt-icons',
	setup(build){
		build.onResolve(
			{ 
				filter: /\.svg$/,
				namespace: 'file'
			},
			async ({ path: iconPath, resolveDir }) => ({
				path: path.resolve(
					path.join(resolveDir, iconPath)
				),
				namespace: 'icon',
			})
		)

		build.onLoad(
			{ 
				filter: /.*/,
				namespace: 'icon'
			},
			async ({ path: manifestOrIconPath }) => {
				let xid = generateXid(5)
				let manifest

				if(manifestOrIconPath.endsWith('.json')){
					manifest = JSON.parse(
						fs.readFileSync(manifestOrIconPath, 'utf-8')
					)
				}else{
					manifest = {
						variants: [
							{
								file: manifestOrIconPath
							}
						]
					}
				}

				captures.push({
					xid,
					manifest,
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