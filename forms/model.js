import { createEmitter } from '@mwni/events'

export default ({ data: initalData, constraints }) => {
	let events = createEmitter()
	let data = { ...initalData }
	let status = {}

	function applyConstraints(final){
		status = {}

		for(let { key, check, eager } of constraints){
			if(!final && !eager)
				continue

			try{
				check(data)
			}catch(error){
				status[key] = {
					invalid: true,
					message: error.toString()
				}
			}
		}
	}

	function applyConstraint(targetKey){
		delete status[targetKey]

		for(let { key, check } of constraints){
			if(key !== targetKey)
				continue

			try{
				check(data)
			}catch(error){
				status[key] = {
					invalid: true,
					message: error.toString()
				}
			}
		}
	}

	return {
		...events,
		get status(){
			return status
		},
		get(key){
			return data[key]
		},
		set(key, value){
			data[key] = value
			applyConstraints()
			events.emit('change', { key, value })
		},
		isValid(key){
			if(key){
				return !status[key]?.invalid
			}else{
				return Object.values(status).every(
					status => !status.invalid
				)
			}
			
		},
		submit(){

		}
	}
}