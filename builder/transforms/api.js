import pu from 'path'
import { getBlockBounds } from './base.js'
import { get as template } from '../lib/templates.js'



export function transform({ code, path }){
	let apis = []
	let apiMatch = code.match(/\@(api\((.+)\))\s+export\s+default\s+class\s+(.*)\{/)

	if(apiMatch){
		let [apiMatchBlock, apiDecorator, apiDef, apiClass] = apiMatch
		let apiBounds = getBlockBounds(code, apiMatch.index + apiMatchBlock.length - 1, true)
		let apiBlock = code.slice(...apiBounds)

		let methodRegex = /\@((get|post|delete)\((.+)\))\s*(static)?\s(async)?\s*(.+)\((.*)\)\s*\{/g
		let methodMatch
		let routes = []
		let api = {
			id: apiClass
		}

		while((methodMatch = methodRegex.exec(apiBlock)) !== null){
			let [matchBlock, decorator, method, def, staticKw, asyncKw, name, args] = methodMatch

			routes.push({
				static: !!staticKw,
				name,
				method,
				def,
				args: args
					.replace(/[/][/].*$/mg,'')
					.replace(/\s+/g, '')
					.replace(/[/][*][^/*]*[*][/]/g, '')
					.split('){', 1)[0].replace(/^[^(]*[(]/, '')
					.replace(/=[^,]+/g, '')
					.split(',')
					.filter(Boolean)
			})

			
			apiBlock = (
				apiBlock.slice(0, methodMatch.index) 
				+ apiBlock.slice(methodMatch.index + decorator.length + 1)
			)
		}

	
		api.class = apiClass || 'Model'
		api.resolveDir = pu.dirname(path)
		api.serverCode = template('api.server.js', {
			head: code.slice(0, apiMatch.index),
			class: api.class,
			def: apiDef,
			apiBlock,
			tail: code.slice(apiBounds[1]),
			routes
		})


		code = template('api.client.js', {
			def: apiDef,
			routes
		})

		apis.push(api)
	}

	return {code, apis}
}


export function skip({ code, path }){
	return !/\@api\(/g.test(code)
}