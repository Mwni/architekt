import { Fragment, Text } from '@architekt/ui'

export default Fragment(({ ctx, model, key, ...props }) => {
	model = model || ctx.upstream.model

	if(key){
		let status = model.fieldStatus[key]
	
		if(!status)
			return

		if(status.valid === false){
			Text({ 
				class: props.class || 'status invalid', 
				text: status.message 
			})
		}
	}else if(model.submissionError?.message){
		Text({ 
			class: props.class || 'status invalid', 
			text: model.submissionError.message
		})
	}
})