import fs from 'fs'
import path from 'path'
import Koa from 'koa'
import Router from '@koa/router'
import { fileURLToPath } from 'url'
import { JSDOM } from 'jsdom'
import { mount as mountComponent } from '@architekt/html'
import { writeDocument } from './document.js'
import { imports } from './importer.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const mimes = {
	default: 'text/plain',
	'.js': 'text/javascript',
	'.css': 'text/css'
}

export default ({ port, clientApp }) => {
	log('starting')

	let koa = new Koa()
	let router = new Router()
	let bootstrapCode = readFile({ filePath: 'bootstrap.js' })

	serveDir({ router, fileDir: './client', webPath: '/app' })
	serveDir({ router, fileDir: './static', webPath: '/app' })
	serveWellKnown({ router })
	serveApp({ router, clientApp, bootstrapCode })

	koa.use(router.routes(), router.allowedMethods())
	koa.listen(port)

	log(`listening on port ${port}`)
}

function serveApp({ router, clientApp, bootstrapCode }){
	router.get('/(.*)', async ctx => {
		let dom = new JSDOM()
		let page = {
			status: 'ok',
			title: undefined,
			route: '/'
		}

		mountComponent(
			dom.window.document.body, 
			clientApp, 
			{ page }
		)

		writeDocument({
			ctx,
			dom,
			page,
			imports,
			bootstrapCode,
		})
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

function readFile({ filePath }){
	return fs.readFileSync(path.join(__dirname, filePath), 'utf-8')
}

function log(...args){
	console.log('[\x1b[32marchitekt-server\x1b[0m]', ...args)
}

function error(...args){
	console.error('[\x1b[31marchitekt-server\x1b[0m]', ...args)
}