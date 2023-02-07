export function deriveVariants(plugins = []){
	let unconditionalPlugins = plugins.filter(plugin => !plugin.condition)
	let conditionalPlugins = plugins.filter(plugin => plugin.condition)
	let baseVariant = {
		bundleSuffix: '',
		plugins: [],
		chunkTransforms: []
	}

	let variants = [
		baseVariant
	]

	for(let plugin of unconditionalPlugins){
		baseVariant.plugins.push(plugin)

		if(plugin.transformChunks)
			baseVariant.chunkTransforms.push(plugin.transformChunks)
	}

	for(let plugin of conditionalPlugins){
		variants.push({
			bundleSuffix: `.${plugin.bundleSuffix || plugin.id}`,
			plugins: [...baseVariant.plugins, plugin],
			chunkTransforms: [
				...(plugin.transformChunks ? [plugin.transformChunks] : []),
				...baseVariant.chunkTransforms
			],
			condition: plugin.condition
		})
	}

	return variants.map(
		variant => ({
			...variant,
			name: variant.plugins
				.map(plugin => plugin.id)
				.join(' + ')
		})
	)
}

export function reconcileVariants(plugins){
	return plugins
		.filter(plugin => plugin.condition)
		.map((plugin, i) => ({
			bundleSuffix: plugin.bundleSuffix,
			condition: plugin.condition,
			scopes: {
				js: !!plugin.js,
				css: !!plugin.css
			}
		}))
}

