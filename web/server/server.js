import fs from 'fs'
import path from 'path'
import Koa from 'koa'
import Router from '@koa/router'
import { fileURLToPath } from 'url'
import { JSDOM } from 'jsdom'
import { fetch } from '@architekt/api'
import { awaitAsyncNodes } from '@architekt/render'
import { mount as mountComponent } from '@architekt/html'
import { writeDocument } from './document.js'
import { imports } from './importer.js'
import clientComponent from './client.js'
import createCookies from './cookies.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const mimes = {
	default: 'text/plain',
	'.js': 'text/javascript',
	'.css': 'text/css'
}

const descriptor = { 
	name: 'architekt-server'
}

export default async ({ port, clientApp }) => {
	Object.assign(
		descriptor, 
		readFile({ 
			filePath: 'package.json',
			json: true
		})
	)

	log('starting')

	let koa = new Koa()
	let router = new Router()
	let bootstrapCode = readFile({ filePath: 'client/bootstrap.js' })

	await serveFunctions({ router })

	serveDir({ router, fileDir: './client', webPath: '/app' })
	serveDir({ router, fileDir: './static', webPath: '/app' })
	serveWellKnown({ router })
	serveApp({ router, clientApp, bootstrapCode })

	koa.use(router.routes(), router.allowedMethods())
	koa.listen(port)

	fetch.config({
		urlBase: `http://localhost:${port}`
	})

	log(`listening on port ${port}`)
}

function serveApp({ router, clientApp, bootstrapCode }){
	router.get('/(.*)', async ctx => {
		let dom = new JSDOM()
		let page = {
			status: 'ok',
			title: undefined
		}

		dom.reconfigure({ 
			url: `http://app${ctx.path}`
		})

		try{
			let node = mountComponent(
				dom.window.document.body, 
				clientComponent, 
				{ 
					page, 
					clientApp,
					cookies: createCookies(ctx)
				}
			)

			await new Promise(resolve => {
				awaitAsyncNodes(node, resolve)
			})

			let destinationPath = dom.window.document.location.href.slice(
				'http://app'.length
			)


			if(destinationPath === ctx.path){
				writeDocument({
					ctx,
					dom,
					page,
					imports,
					bootstrapCode,
				})
			}else{
				ctx.redirect(destinationPath)
			}
		}catch(e){
			error(`encountered error while rendering ${ctx.path}:\n`, e)
		}
	})
}

function serveWellKnown({ router }){
	router.get('/favicon.ico', async ctx => {
		ctx.throw(404)
	})
}

function serveDir({ router, fileDir, webPath }){
	let absFileDir = path.join(__dirname, fileDir)

	for(let file of fs.readdirSync(absFileDir)){
		let { ext } = path.parse(file)
		let mime = mimes[ext] || mimes.default
		let content = fs.readFileSync(path.join(absFileDir, file))

		log(`serving ${file} at ${webPath}/${file}`)

		router.get(`${webPath}/${file}`, async ctx => {
			ctx.body = content
			ctx.type = mime
		})
	}
}

async function serveFunctions({ router }){
	let file = path.join(__dirname, 'server', 'functions.js')

	if(!fs.existsSync(file))
		return

	let { default: init } = await import(`file://${file}`)

	init(router)
	log(`server functions initialized`)
}

function readFile({ filePath, json }){
	let text = fs.readFileSync(path.join(__dirname, filePath), 'utf-8')

	return json
		? JSON.parse(text)
		: text
}

function log(...args){
	console.log(`[\x1b[32m${descriptor.name}\x1b[0m]`, ...args)
}

function error(...args){
	console.error(`[\x1b[31m${descriptor.name}\x1b[0m]`, ...args)
}