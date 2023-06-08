import path from 'path'
import template from '../template.js'
import { generateXid } from '../lib/xid.js'


export default ({ projectPath, emissions }) => ({
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

		build.onResolve(
			{ 
				filter: /\.(html)$/,
				namespace: 'file'
			},
			async ({ path: stylesheetPath, resolveDir }) => ({
				path: path.resolve(
					path.join(resolveDir, stylesheetPath)
				),
				namespace: 'html',
			})
		)

		build.onLoad(
			{ 
				filter: /.*/,
				namespace: 'asset'
			},
			async ({ path }) => {
				let xid = generateXid(5)

				emissions.push({
					xid,
					path
				})

				return {
					contents: JSON.stringify({ xid }),
					loader: 'json'
				}
			}
		)

		build.onLoad(
			{ 
				filter: /.*/,
				namespace: 'html'
			}, 
			async ({ path, pluginData, ...args }) => {
				let xid = generateXid(5)
				
				emissions.push({
					path,
					xid
				})

				return {
					contents: template({
						file: 'html.js',
						fields: { xid }
					}),
					resolveDir: projectPath,
					loader: 'js',
					pluginData: {
						...pluginData,
						resolveOverride: {
							namespace: 'file'
						}
					}
				}
			}
		)
	}
})