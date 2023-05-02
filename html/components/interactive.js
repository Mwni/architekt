import { Component } from '@architekt/ui'

export default Component(({ ctx }) => {
	return ({ onTap }, content) => {
		content()

		ctx.afterRender(
			() => {
				for(let element of ctx.dom){
					element._onTap = onTap

					if(!element.classList.contains('a-interactive')){
						element.classList.add('a-interactive')
						element.addEventListener('click', evt => element._onTap(evt))
					}
				}
			}
		)
	}
})