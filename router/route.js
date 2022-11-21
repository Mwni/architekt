import { getContext, Component } from '@architekt/ui'


export default Component(() => {
	let { router } = getContext()
	let baseChain = router.currentResolve.chain.slice()

	return ({ route, fallback, bad }, content) => {
		if(route){
			if(router.shouldEnterRoute([...baseChain, route]))
				content()
		}else if(fallback){
			if(router.shouldEnterFallback(bad))
				content()
		}
	}
})