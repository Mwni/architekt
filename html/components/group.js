import { Component, getContext } from '@architekt/ui'
import { getChildElements } from '@architekt/render'

export default Component((props, content) => {
	let { node, afterDomCreation } = getContext()
	
	afterDomCreation(dom => {
		for(let element of dom){
			element.classList.add('a-group-member')
			element.addEventListener('click', evt => {
				for(let child of node.children){
					for(let element of getChildElements(child)){
						element.click()
					}
				}
			})
		}
	})

	return content
})