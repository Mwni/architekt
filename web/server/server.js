import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import Koa from 'koa'
import mount from 'koa-mount'
import serve from 'koa-static'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default ({ port }) => {
	log('starting')

	let koa = new Koa()
	let bootstrapCode = readFile({ filePath: 'bootstrap.js' })

	koa.use(serveDir({ fileDir: 'js', webPath: '/js' }))
	koa.use(serveApp())

	koa.listen(port)

	log(`listening on port ${port}`)
}

function serveApp(){
	return async ctx => {
		console.log(ctx.path)
	}
}

function serveDir({ fileDir, webPath }){
	return mount(
		webPath,
		serve(path.join(__dirname, fileDir))
	)
}

function readFile({ filePath }){
	return fs.readFileSync(path.join(__dirname, filePath))
}

function log(...args){
	console.log('[\x1b[32marchitekt-server\x1b[0m]', ...args)
}

function error(...args){
	console.error('[\x1b[31marchitekt-server\x1b[0m]', ...args)
}

/*

import Router from '@koa/router'
import serve from 'koa-static'
import mount from 'koa-mount'
import parse from 'koa-body'
import render from './render.js'
import Page from './page.js'
import Frame from './frame.js'
import Layout from './layout.js'
import Assets from '../shared/assets.js'
import Routing from './routing.js'
import Fetch from './fetch.js'
import I18n from '../shared/localization/i18n.js'
import I18nParse from '../shared/localization/parse.js'
import netpath from './netpath.js'
import beautify from 'js-beautify'
import fetch from 'node-fetch'

global.fetch = fetch


export default class Server{
	constructor({ root, blueprint, assets, apis }){
		this.log('starting...')

		this.root = root
		this.blueprint = blueprint
		this.assets = assets
		this.apis = apis
		this.errorHandlers = []
		this.models = []
		this.inline = {}
		this.setup()
		this.build()
	}

	setup(){
		this.loadInlineAsset(
			'bootstrap', 
			pu.join(this.root, 'browser', 'bootstrap.js')
		)

		this.defaultPage = {
			status: 200,
			meta: [
				{charset: 'utf-8'},
				{
					name: 'viewport', 
					content: 'width=device-width, initial-scale=1, maximum-scale=1, shrink-to-fit=no'
				}
			],
			styles: [{
				src: '/x/app.css',
				noscript: true
			}],
			scripts: [{
				content: this.inline.bootstrap,
				head: true
			}],
			favicons: this.assets.favicons
		}
	}

	async build(){
		this.koa = new Koa()
		this.router = new Router()

		for(let api of this.apis){
			this.serveApi(api)
		}

		this.serveStatic('/x', pu.resolve(pu.join(this.root, 'browser')))

		let port = this.blueprint.server?.port || 80

		if(this.blueprint.server?.behindProxy){
			this.koa.use(async (ctx, next) => {
				ctx.state.ip = ctx.headers['x-real-ip'] 
					|| ctx.headers['x-forwarded-ip']
					|| ctx.headers['X-Forwarded-Ip']
					|| ctx.ip

				return await next(ctx)
			})
		}

		this.koa.use(async (ctx, next) => {
			try{
				ctx.state.exposed = {}
				
				return await next(ctx)
			}catch(e){
				for(let {handler, error} of this.errorHandlers){
					if( e instanceof error){
						await handler(ctx, e)
						return
					}
				}

				if(e.expose){
					ctx.status = e.statusCode || 400
					ctx.body = e
				}else if(!e.statusCode || e.statusCode === 500){
					ctx.status = 500
					ctx.body = `Internal Server Error`

					this.error('internal error occured at:', ctx.path, '\n', e)
				}else{
					ctx.status = e.statusCode
					ctx.body = `HTTP Error ${e.statusCode}`
				}
			}
		})

		this.koa.use(
			this.router.routes(), 
			this.router.allowedMethods()
		)

		this.koa.use(
			ctx => this.servePage(ctx)
		)

		this.log('serving app on /')

		this.server = this.koa.listen(port)

		this.log('listening on port', port)
	}


	serveApi(api){
		for(let route of api.routes){
			let path = netpath.join(api.def[0], route.def[0])

			if(route.method !== 'get'){
				this.router[route.method](path, parse())
			}

			this.router[route.method](
				path, 
				async ctx => {
					let src = {
						...ctx.params, 
						...(route.method === 'get' ? ctx.query : ctx.request.body)
					}

					try{
						ctx.body = await api.class[route.name](
							...route.args.map(key => src[key])
						)
					}catch(e){
						this.error('internal error while serving api request at', ctx.path, '\n', e)
						ctx.status = 500
					}
				}
			)

			this.log(`mounted api on ${path}`)
		}

		if(api.class.init)
			api.class.init()
	}

	serveStatic(route, dest){
		this.router.all(route + '/(.*)', mount(route, serve(dest)))
		this.log('serving', dest, 'on', route)
	}

	async servePage(ctx){
		let page = new Page(this.defaultPage)
		let frame = new Frame()
		let route = new Routing(ctx)
		let server = {
			status: 200,
			render: {
				wantsRedraw: false,
				redrawCallbacks: []
			}
		}

		let contentVDom = X({
			oninit: x => {
				x.server = server
				x.page = page
				x.frame = frame
				x.route = route
				x.assets = new Assets(this.assets)
				x.redraw = () => {
					server.render.wantsRedraw = true
				}
				x.afterRedraw = cb => {
					server.render.redrawCallbacks.push(cb)
				}
			},
			view: x => X(
				this.blueprint.app, 
				ctx.query
			)
		})

		let contentHTML = await render(contentVDom)
			.catch(e => {
				this.error('error while rendering page at', ctx.path, '\n', e)
				throw e
			})

		if(route.url !== ctx.path){
			ctx.redirect(route.url)
			return
		}

		let pageVDom = X(Layout, {page}, X.trust(contentHTML))
		let pageHTML = await render(pageVDom)

		if(this.blueprint.server?.pretty !== false){
			pageHTML = beautify.html(pageHTML, {
				indent_with_tabs: true,
				indent_scripts: true,
				indent_inner_html: true,
				inline: [],
				extra_liners: [],
				content_unformatted: ['script', 'style'],
			})
		}

		ctx.status = server.status
		ctx.body = pageHTML
	}


	mountResolver(route, resolver){
		if(route === '*')
			route = '(.*)'

		if(resolver.middleware){
			this.router.all(route, resolver.middleware)
		}

		this.log('mounted', 'resolver', 'on', route)
	}

	loadInlineAsset(key, path){
		this.log(`loading inline ${key}`)
		this.inline[key] = fs.readFileSync(path).toString()
	}

	shutdown(){
		this.server.close()
	}

	log(...args){
		console.log('[\x1b[32mserver\x1b[0m]', ...args)
	}

	error(...args){
		console.error('[\x1b[31mserver\x1b[0m]', ...args)
	}
}
*/