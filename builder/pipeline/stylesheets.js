import path from 'path'
import template from '../template.js'
import { generateXid } from '../lib/xid.js'

export default opts => ({
	name: 'architekt-stylesheets',
	setup(build){
		build.onResolve(
			{ 
				filter: /\.(css|scss|sass)$/,
				namespace: 'file'
			},
			async ({ path: stylesheetPath, resolveDir }) => ({
				path: path.resolve(
					path.join(resolveDir, stylesheetPath)
				),
				namespace: 'stylesheet',
			})
		)

		build.onLoad(
			{ 
				filter: /.*/,
				namespace: 'stylesheet'
			}, 
			async ({ path, pluginData, ...args }) => {
				let xid = generateXid(5)

				opts.emissions.push({
					path,
					xid
				})

				return {
					contents: template({
						file: 'stylesheet.js',
						fields: { xid }
					}),
					resolveDir: opts.projectPath,
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