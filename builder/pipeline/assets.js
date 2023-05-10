import fs from 'fs'
import path from 'path'
import { generateXid } from '../lib/xid.js'


export default ({ emissions }) => ({
	name: 'architekt-assets',
	setup(build){
		build.onResolve(
			{
				filter: /\.(svg|png|jpg|gif)$/,
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
				let mapFilePath = file => path.resolve(
					path.join(
						path.dirname(manifestOrAssetPath),
						file
					)
				)

				if(ext === '.json'){
					manifest = JSON.parse(
						fs.readFileSync(manifestOrAssetPath, 'utf-8')
					)

					if(manifest.file){
						manifest.file = mapFilePath(manifest.file)
					}else if(manifest.variants){
						for(let key of Object.keys(manifest.variants)){
							manifest.variants[key].file = mapFilePath(manifest.variants[key].file)
						}
					}
				}else if(ext === '.svg'){
					manifest = svgLoader(manifestOrAssetPath)
				}else{
					manifest = defaultAssetLoader(manifestOrAssetPath)
				}

				emissions.push({
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

function svgLoader(path){
	let svg = fs.readFileSync(path, 'utf-8')
	let templatesRegex = /\{\{([^}]+)\}\}/g
	let result
	let styleKeys = []
  
	while((result = templatesRegex.exec(svg)) !== null){
		styleKeys.push(result[1])
	}

	return {
		type: 'svg',
		file: path,
		styleKeys: styleKeys.length > 0 
			? styleKeys 
			: undefined
	}
}

function defaultAssetLoader(path){
	return {
		type: 'image',
		file: path
	}
}