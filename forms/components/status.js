import { Fragment, Text } from '@architekt/ui'

export default Fragment(({ model, key }) => {
	let status = model.status[key]
	
	if(!status)
		return

	if(status.invalid){
		Text({ class: 'status invalid', text: status.message })
	}
})