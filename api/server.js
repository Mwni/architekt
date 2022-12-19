import makeJsonParser from 'koa-json-body'

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

function execute(ctx, func){
	try{
		ctx.type = 'json'
		ctx.body = JSON.stringify(
			func(ctx.state.payload)
		)
	}catch(error){
		let { expose, message, statusCode, ...extra } = error

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