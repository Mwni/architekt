import { Fragment, Text } from '@architekt/ui'

export default Fragment(({ ctx, model, key, ...props }, content) => {
	model = model || ctx.upstream.model

	let issueMessage

	if(key){
		let status = model.fieldStatus[key]
	
		if(!status)
			return

		if(status.valid === false){
			issueMessage = status.message
		}
	}else if(model.submissionError?.message){
		issueMessage = model.submissionError.message
	}

	if(!issueMessage)
		return

	if(content){
		content({ message: issueMessage })
	}else{
		Text({ 
			class: props.class || 'status invalid', 
			text: status.message 
		})
	}
})