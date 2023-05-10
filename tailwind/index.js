import fs from 'fs'
import tailwind from 'tailwindcss/lib/processTailwindFeatures.js'
import tailwindResolveConf from 'tailwindcss/lib/public/resolve-config.js'

const resolveConfig = tailwindResolveConf.default



export default config => ({
	id: 'tailwind',
	postcssPlugins: [
		{
			init: ({ projectPath, chunk }) => {
				let state = {
					context: null,
					watcher: null,
					changedContent: [],
					configDependencies: new Set(),
					contextDependencies: new Set(),
					contentPaths: [],
					get config() {
						return this.context.tailwindConfig
					},
					getContext({ createContext, configPath, config, nonCssContent }) {
						if (this.context) {
							this.context.changedContent = this.changedContent.splice(0)
				
							return this.context
						}
				
						  this.context = createContext(
							resolveConfig(
								config, 
								{
									content: { 
										files: []
									}
								}
							), 
							[]
						)
				
						Object.assign(this.context, {
							userConfigPath: configPath,
						})
				
						this.context.changedContent.push(...nonCssContent)
				  
						 return this.context
					}
				}
				
				return {
					postcssPlugin: 'tailwindcss',
					async Once(root, { result }){
						let configPath = `${projectPath}/tailwind.config.js`
						let config = fs.existsSync(configPath)
							? (await import(`file://${configPath}`)).default
							: {}

						tailwind.default(({ createContext }) => {
							return () => state.getContext({
								createContext,
								configPath,
								config,
								root,
								result,
								nonCssContent: [{
									content: chunk.code,
									extension: 'js'
								}]
							})
						})(root, result)
					}
				}
			}
		}
	],
})