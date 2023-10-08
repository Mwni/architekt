import makeJsonParser from 'koa-json-body'
import getRawBody from 'raw-body'

const jsonParse = makeJsonParser({ fallback: true })

export function get({ path }, router, func){
	router.get(
		path,
		(ctx, next) => {
			ctx.state.payload = ctx.query
			return next(ctx)
		},
		ctx => execute(ctx, func)
	)
}

export function post({ path }, router, func){
	router.post(
		path,
		jsonParse,
		(ctx, next) => {
			ctx.state.payload = ctx.request.body
			return next(ctx)
		},
		ctx => execute(ctx, func)
	)
}

export function upload({ path }, router, func){
	router.post(
		path,
		async (ctx, next) => {
			try{
				ctx.state.payload = {
					file: {
						type: ctx.headers['content-type'],
						name: ctx.headers['file-name'],
						buffer: await getRawBody(ctx.req),
					}
				}
			}catch(error){
				ctx.status = 400
				ctx.body = {
					message: `Corrupted File (${error.message})`
				}
			}
			return next(ctx)
		},
		ctx => execute(ctx, func)
	)
}

async function execute(ctx, func){
	try{
		ctx.type = 'json'
		ctx.body = JSON.stringify(
			await func({
				...ctx.state.payload,
				ctx
			}) || null
		)
	}catch(error){
		let { expose, message, statusCode, ...extra } = error

		console.warn(error)

		if(expose){
			ctx.status = statusCode || 400
			ctx.body = { 
				message, 
				...extra
			}
		}else if(!statusCode || statusCode === 500){
			ctx.status = 500
			ctx.body = {
				message: 'Server Error'
			}
		}else{
			ctx.status = statusCode
			ctx.body = {
				message: `HTTP Error ${statusCode}`
			}
		}
	}
}