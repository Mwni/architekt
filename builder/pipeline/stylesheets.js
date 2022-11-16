import template from '../template.js'

export default opts => ({
	name: 'architekt-stylesheets',
	setup(build){
		build.onLoad(
			{ 
				filter: /\.(css|scss|sass)$/,
				namespace: 'file'
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
					})
				}
			}
		)
	}
})