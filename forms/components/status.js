import { Fragment, Text } from '@architekt/ui'

export default Fragment(({ model, key, ...props }) => {
	if(key){
		let status = model.fieldStatus[key]
	
		if(!status)
			return

		if(status.invalid){
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