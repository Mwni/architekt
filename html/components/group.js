import { Component } from '@architekt/ui'

export default Component(({ ctx }, content) => {
	ctx.afterRender(() => {
		let dom = ctx.dom

		for(let element of dom){
			element.classList.add('a-group-member')

			element.addEventListener('click', evt => {
				for(let sibling of dom){
					if(sibling === element)
						continue

					console.log('click', sibling)
					sibling.click()
				}
			})
		}
	})

	return (props, content) => content()
})