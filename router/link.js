import { getContext, Component, Interactive } from '@architekt/ui'

export default Component(() => {
	let { router } = getContext()
	let path = router.getResolvingPath()

	return (props, content) => {
		Interactive(
			{
				href: props.route,
				tapAction: event => {
					event.preventDefault()
					router.setRoute({ ...props, fromPath: path })
				}
			},
			content || props.text
		)
	}
})