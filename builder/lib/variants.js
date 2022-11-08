export function derive(division, plugins){
	let variants = [{plugins: [], transforms: [], includes: []}]
	let relevantPlugins = plugins.filter(plugin => plugin[division])
	let unconditionalPlugins = relevantPlugins.filter(plugin => !plugin.condition)
	let conditionalPlugins = relevantPlugins.filter(plugin => plugin.condition)

	for(let plugin of unconditionalPlugins){
		variants[0].plugins.push(...(plugin[division].plugins || []))
		variants[0].transforms.push(...(plugin[division]?.transforms || []))
		variants[0].includes.push(...(plugin[division].includes || []))
	}

	for(let plugin of conditionalPlugins){
		variants.push({
			slug: plugin.slug,
			plugins: [...variants[0].plugins, ...(plugin[division].plugins || [])],
			transforms: [...variants[0].transforms, ...(plugin[division]?.transforms || [])],
			includes: [...variants[0].includes, ...(plugin[division].includes || [])],
			condition: plugin.condition
		})
	}

	return variants
}

export function reconcile(plugins){
	return plugins
		.filter(plugin => plugin.condition)
		.map((plugin, i) => ({
			slug: plugin.slug,
			condition: plugin.condition,
			divisions: {
				js: !!plugin.js,
				css: !!plugin.css
			}
		}))
}

