import fs from 'fs'
import path from 'path'
import { generateXid } from '../lib/xid.js'


export default ({ captures }) => ({
	name: 'architekt-assets',
	setup(build){
		build.onResolve(
			{ 
				filter: /\.(svg|png|jpg)$/,
				namespace: 'file'
			},
			async ({ path: assetPath, resolveDir }) => ({
				path: path.resolve(
					path.join(resolveDir, assetPath)
				),
				namespace: 'asset',
			})
		)

		build.onLoad(
			{ 
				filter: /.*/,
				namespace: 'asset'
			},
			async ({ path: manifestOrAssetPath }) => {
				let { ext } = path.parse(manifestOrAssetPath)
				let xid = generateXid(5)
				let manifest

				if(ext === '.json'){
					manifest = JSON.parse(
						fs.readFileSync(manifestOrAssetPath, 'utf-8')
					)
				}else{
					manifest = {
						file: manifestOrAssetPath
					}
				}

				captures.push({
					xid,
					manifest,
					path: manifestOrAssetPath
				})

				return {
					contents: JSON.stringify({ xid }),
					loader: 'json'
				}
			}
		)
	}
})