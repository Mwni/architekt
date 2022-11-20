import template from '../template.js'
import path from 'path'

export default opts => ({
	name: 'architekt-stylesheets',
	setup(build){
		build.onResolve(
			{ 
				filter: /\.(css|scss|sass)$/,
				namespace: 'file'
			},
			async ({ path: stylesheetPath }) => ({
				path: path.resolve(stylesheetPath),
				namespace: 'stylesheet'
			})
		)

		// this is because stylesheet files get replaced with a .js file importing the stylesheet component
		build.onResolve(
			{ 
				filter: /.*$/,
				namespace: 'stylesheet'
			},
			async ({ path, ...args }) => await build.resolve(
				path,
				{
					...args,
					namespace: 'file',
					resolveDir: opts.rootPath
				}
			)
		)

		build.onLoad(
			{ 
				filter: /.*/,
				namespace: 'stylesheet'
			}, 
			async ({ path, ...args }) => {
				let xid = Math.random()
					.toString(32)
					.slice(2, 7)
					.padStart(5, 'x')
					.toLowerCase()

				opts.captures.push({
					path,
					xid
				})

				return {
					contents: template({
						file: 'stylesheet.js',
						fields: { xid }
					}),
					loader: 'js'
				}
			}
		)
	}
})