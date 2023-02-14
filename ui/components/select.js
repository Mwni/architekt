import { Fragment, Interactive, Text } from '../index.js'

export default Fragment(({ value, onSelect, selectedClass }, content) => {
	return content().map(
		node => Interactive(
			{
				value: node.props.value,
				onTap: () => {
					onSelect(node.props.value)
				}
			},
			() => [
				{
					...node,
					props: {
						...node.props,
						color: 'red',
						selected: value === node.props.value,
						class: [
							node.props.class,
							value === node.props.value && selectedClass
						]
					}
				}
			]
		)
	)
})

/*
export default Component(({ value, onSelect, selectedClass }) => {
	let { node } = getContext()

	node.childPatch = (render, props, content) => {
		return [
			Interactive,
			{
				
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
		
		let nodes = content()

		console.log(nodes.map(node => node.props))
	}
})
*/