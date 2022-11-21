import { getContext, Component, Interactive } from '@architekt/ui'

export default Component(() => {
	let { route } = getContext()

	return (props, content) => {
		Interactive(
			{
				href: route.resolve(props),
				tapAction: event => {
					event.preventDefault()
					route.set(props)
				}
			},
			content || props.text
		)
	}
})