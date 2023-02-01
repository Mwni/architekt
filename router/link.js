import { getContext, Component, Interactive, WebLink } from '@architekt/ui'

export default Component(() => {
	let { route } = getContext()

	return (props, content) => {
		Interactive(
			{
				onTap: event => {
					event.preventDefault()
					route.set(props)
				}
			},
			() => WebLink(
				{
					...props,
					class: ['link', props.class],
					url: route.resolve(props),
				},
				content || props.text
			)
		)
		
	}
})