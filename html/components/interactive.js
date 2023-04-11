import { Component } from '@architekt/ui'

export default Component(({ ctx, onTap }) => {
	ctx.afterRender(
		() => {
			for(let element of ctx.dom){
				element.classList.add('a-interactive')
				element.addEventListener('click', onTap)
			}
		}
	)

	return (_, content) => content()
})