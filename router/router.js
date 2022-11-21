import { findParentElement } from '@architekt/render'
import { getContext, Component } from '@architekt/ui'
import { join, relate, match } from './path.js'

export default Component(({}) => {
	let { redraw, node, downstream } = getContext()
	let router = createRouterController({
		window: findParentElement(node).ownerDocument.defaultView,
		redraw,
	})

	downstream.router = router

	return ({}, content) => {
		router.startResolve()
		content()
	}
})

function createRouterController({ window, redraw }){
	let { location, history } = window
	let currentResolve
	let log = [location.pathname]
	let popping = false
	let popQueue = []

	function set({ route, replace, fromPath }){
		if(popping){
			popQueue.push(() => set({ route }))
			return
		}

		let url = relate(route, fromPath)

		if(replace){
			history.replaceState(null, null, url)
			log.pop()
		}else{
			history.pushState(null, null, url)
		}

		log.push(url)
		redraw()
	}

	function conclude(){

	}

	window.addEventListener('popstate', e => {
		let url = location.pathname
		
		popping = false
		log = log.slice(0, log.indexOf(url) + 1)

		if(popQueue.length > 0){
			popQueue.shift()()
		}

		console.log('draw after pop')
		redraw()
	})

	return {
		setRoute: set,
		getResolvingPath(){
			return join(...currentResolve.chain)
		},
		startResolve(){
			currentResolve = {
				chain: []
			}
		},
		shouldEnterRoute(chain){
			console.log('should enter?', chain, join(...chain))
			let matched = match(join(...chain), location.pathname)

			if(!matched)
				return false

			currentResolve.chain = chain
			console.log('yes')
			
			return true
		},
		shouldEnterFallback(bad){
			
		},
		get currentResolve(){
			return currentResolve
		}
	}
}
/*
class Controller extends EventEmitter{
	constructor(){
		super()
		this.injections = {}
		this.root = true
	}

	set(url, options = {}){
		url = this.normalize(url)

		if(options.inject)
			this.inject(url, options.inject)

		this.flush(netpath.clean(url), options)
		this.emit('change', {back: false, replace: options.replace})
	}

	inject(url, data){
		this.injections[url] = data
	}

	resolve(chain, options){
		let matches = []
		let base = chain
			.slice(0, -1)
			.map(routes => routes[0].path.replace(/\*$/, ''))
			.join('/')

		
		for(let route of chain[chain.length-1]){
			let url = netpath.clean(this.url)
			let recon = netpath.join(
				base,
				route.path,
				options.strict || route.path.slice(-1) === '*' ? undefined : '*'
			)

			let params = netpath.match(recon, url)

			if(params){
				let reconParts = recon.split('/')
				let urlParts = url.split('/')
				let unresolved = route.path.endsWith('*')
					? null
					: urlParts.slice(reconParts.length - 1).join('/')

				matches.push({
					route: {...route, params, url: this.url},
					unresolved: unresolved || null,
					length: reconParts.length,
					reconParts
				})
			}
		}


		if(matches.length === 0)
			return

		let [{ route, unresolved }] = matches
			.map(({ route, unresolved, length }, rank) => ({route, unresolved, score: rank - length * 100}))
			.sort((a, b) => a.score - b.score)


		return {
			...route,
			params: {...route.params, ...this.injections[this.url]},
			unresolved
		}
	}

	normalize(url){
		if(url.startsWith('/')){
			url = url
		}else if(url.startsWith('%')){
			url = netpath.join(this.url, url.slice(1))
		}else{
			url = netpath.join(netpath.pop(this.url), url)
		}

		return url
	}
}



class ClientController extends Controller{
	constructor(x){
		super()
		this.x = x
		this.url = this.browserUrl
		this.history = [this.url]
		this.popping = false
		this.popQueue = []

		window.addEventListener('popstate', e => {
			this.url = this.browserUrl
			this.popping = false
			this.history = this.history.slice(0, 
				this.history.indexOf(this.url) + 1)

			this.emit('change', {back: true})

			if(this.popQueue.length > 0){
				this.popQueue.shift()()
			}
		})
	}

	get browserUrl(){
		return window.location.pathname + window.location.search
	}

	set(url, options = {}){
		if(this.popping){
			this.popQueue.push(() => this.set(url, options))
			return
		}

		if(options.pop){
			if(this.history.length > 0){
				this.back()
				return
			}
		}

		super.set(url, options)
	}

	flush(url, options){
		if(this.popping){
			this.popQueue.push(() => this.flush(url, options))
			return
		}

		if(options.replace){
			window.history.replaceState(null, null, url)
			this.history.pop()
		}else{
			window.history.pushState(null, null, url)
		}

		this.history.push(url)
		this.url = url
	}

	back(options = {}){
		if(options.to){
			let target = this.normalize(options.to)
			let index = this.history.indexOf(target)

			if(index < 0){
				this.set(options.to, {...options, replace: false})
			}else{
				let steps = this.history.length - index - 1

				for(let i=0; i<steps; i++){
					this.back()
				}
			}

			return
		}else if(options.escape){
			let target = netpath.join(this.normalize(options.escape), '*')
			let stack = this.history.slice()

			while(netpath.match(target, stack.pop())){
				this.back()
			}

			return
		}

		if(typeof options === 'string')
			options = {fallback: options}

		if(this.popping){
			this.popQueue.push(() => this.back(options))
			return
		}

		if(this.history.length <= 1 && options.fallback){
			this.set(options.fallback, {...options, replace: true})
			return
		}

		if(options.inject)
			this.inject(this.history.slice(-2)[0], options.inject)

		this.popping = true
		window.history.back()
	}
}
*/