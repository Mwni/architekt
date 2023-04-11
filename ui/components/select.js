import { Component, Interactive } from '../index.js'

export default Component(({ value, onSelect, selectedClass }, content) => {
	return content().map(
		node => Option({
			selected: value === node.props.value,
			value: node.props.value,
			onSelect,
			selectedClass,
			node
		})
	)
})

const Option = Component(({ ctx, selected, value, onSelect, selectedClass, node }) => {
	ctx.public({ 
		optionSelected: selected 
	})

	return Interactive(
		{
			onTap: () => {
				onSelect(value)
			}
		},
		[
			{
				...node,
				props: {
					...node.props,
					selected,
					class: [
						node.props.class,
						selected && selectedClass
					]
				}
			}
		]
	)
})