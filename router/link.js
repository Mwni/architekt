import { Component, Interactive, WebLink } from '@architekt/ui'

export default Component(({ ctx }) => {
	return (props, content) => {
		Interactive(
			{
				onTap: event => {
					event.preventDefault()
					ctx.upstream.route.set(props)
				}
			},
			() => WebLink(
				{
					...props,
					class: ['a-link', props.class],
					url: ctx.upstream.route.resolve(props),
				},
				content || props.text
			)
		)
		
	}
})