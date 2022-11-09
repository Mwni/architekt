import { Component, VStack, Headline, Text, getContext } from '@architekt/ui'


export default Component(() => {
	let { redraw } = getContext()
	let Lazy

	import('./Lazy.js').then(component => {
		Lazy = component
		redraw()
	})
	
	return () => {
		VStack(() => {
			Headline({ text: `Async Component` })

			if(Lazy)
				Lazy()
			else
				Text({ text: `loading...` })
		})
	}
})