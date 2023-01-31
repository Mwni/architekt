import { getContext, Component, Interactive } from '@architekt/ui'

export default Component(() => {
	let { route } = getContext()

	return (props, content) => {
		Interactive(
			{
				...props,
				class: ['link', props.class],
				href: route.resolve(props),
				onTap: event => {
					event.preventDefault()
					route.set(props)
				}
			},
			content || props.text
		)
	}
})