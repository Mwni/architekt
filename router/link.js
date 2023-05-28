import { Fragment, Interactive, WebLink } from '@architekt/ui'

export default Fragment(({ ctx, ...props }, content) => {
	let { route } = ctx.upstream
	let path = props.path === '/'
		? '/'
		: `${props.path}/*`

	let active = !!route.match({ path })

	return Interactive(
		{
			onTap: event => {
				event.preventDefault()
				route.set(props)
			}
		},
		() => WebLink(
			{
				...props,
				class: ['a-link', props.class],
				url: route.resolve(props),
				active
			},
			content ? () => content({ active }) : props.text
		)
	)
})