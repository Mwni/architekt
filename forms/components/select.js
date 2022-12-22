import { getContext, Component, Interactive } from '@architekt/ui'

export default Component(({ model, key }) => {
	let { node, teardown } = getContext()

	node.childPatch = (render, props, content) => {
		return [
			Interactive,
			{
				tapAction: () => {
					model.set(key, props.value)
				}
			},
			() => render(
				{
					...props,
					selected: model.get(key) === props.value,
				}, 
				content
			)
		]
	}

	return (props, content) => {
		if(props.model !== model || props.key !== key)
			return teardown()

		content()
	}
})