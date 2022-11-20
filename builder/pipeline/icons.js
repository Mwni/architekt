import fs from 'fs'
import path from 'path'
import { generateXid } from '../lib/xid.js'


export default ({ captures }) => ({
	name: 'architekt-icons',
	setup(build){
		build.onLoad(
			{ 
				filter: /.*/,
				namespace: 'icon'
			},
			async ({ path: manifestOrIconPath }) => {
				let xid = generateXid(5)
				let manifest = JSON.parse(
					fs.readFileSync(manifestOrIconPath, 'utf-8')
				)
				
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