import { Component, getContext } from '@architekt/ui'

export default Component(({ onTap, ...props }) => {
	let { afterDomCreation } = getContext()
	
	afterDomCreation(dom => {
		for(let element of dom){
			element.classList.add('a-interactive')
			element.addEventListener('click', onTap)
		}
	})

	return (_, content) => content()
})