import path from 'path'
import { pathToFileURL } from 'url'

export async function loadPlugins(plugins){
	return await Promise.all(
		plugins.map(
			async plugin => {
				let pluginFile = path.join(projectPath, 'node_modules', plugin, 'index.js')
				let { default: createPlugin } = await import(pathToFileURL(pluginFile))
				
				return createPlugin(config)
			}
		)
	)
}