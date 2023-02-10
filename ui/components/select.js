import { getContext, Component, Interactive } from '../index.js'

export default Component(({ value, onSelect, selectedClass }) => {
	let { node } = getContext()

	node.childPatch = (render, props, content) => {
		return [
			Interactive,
			{
				value: props.value,
				onTap: () => {
					onSelect(props.value)
				}
			},
			() => render(
				{
					...props,
					selected: value === props.value,
					class: [
						props.class,
						value === props.value && selectedClass
					]
				}, 
				content
			)
		]
	}

	return (props, content) => {
		value = props.value
		onSelect = props.onSelect
		selectedClass = props.selectedClass
		content()
	}
})