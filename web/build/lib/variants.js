export function deriveVariants(division, plugins){
	let relevantPlugins = plugins.filter(plugin => plugin[division])
	let unconditionalPlugins = relevantPlugins.filter(plugin => !plugin.condition)
	let conditionalPlugins = relevantPlugins.filter(plugin => plugin.condition)
	let baseVariant = {
		bundleSuffix: '',
		plugins: [],
		chunkTransforms: []
	}

	let variants = [
		baseVariant
	]

	for(let plugin of unconditionalPlugins){
		let scope = plugin[division]

		baseVariant.plugins.push(...(scope.plugins || []))

		if(scope.chunkTransform)
			baseVariant.chunkTransforms.push(scope.chunkTransform)
	}

	for(let plugin of conditionalPlugins){
		let scope = plugin[division]

		variants.push({
			bundleSuffix: `.${plugin.bundleSuffix}`,
			plugins: [...baseVariant.plugins, ...(scope.plugins || [])],
			chunkTransforms: [
				...(scope.chunkTransform ? [scope.chunkTransform] : []),
				...baseVariant.chunkTransforms
			],
			condition: plugin.condition
		})
	}

	return variants
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

