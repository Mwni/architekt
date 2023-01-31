import { getContext, Component, Interactive } from '../index.js'

export default Component(({ value, onSelect }) => {
	let { node } = getContext()

	node.childPatch = (render, props, content) => {
		return [
			Interactive,
			{
				onTap: () => {
					onSelect(props.value)
				}
			},
			() => render(
				{
					...props,
					selected: value === props.value,
				}, 
				content
			)
		]
	}

	return (props, content) => {
		value = props.value
		onSelect = props.onSelect
		content()
	}
})