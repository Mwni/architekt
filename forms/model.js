import { createEmitter } from '@mwni/events'

export default ({ data: initalData, constraints = [], submit: submitFunc }) => {
	let model
	let events = createEmitter()
	let data = { ...initalData }
	let fieldStatus = {}
	let submitting = false
	let submissionError

	function applyConstraints(final){
		fieldStatus = {}

		for(let { key, check, eager } of constraints){
			if(!final && !eager)
				continue

			if(fieldStatus[key]?.valid === false)
				continue

			try{
				check(data)
				fieldStatus[key] = { valid: true }
			}catch(error){
				fieldStatus[key] = {
					valid: false,
					message: error.toString()
				}
			}
		}
	}

	return model = {
		...events,
		get data(){
			return data
		},
		get fieldStatus(){
			return fieldStatus
		},
		get isEagerValid(){
			return constraints
				.filter(({ eager }) => eager)
				.every(({ key }) => fieldStatus[key]?.valid)
		},
		get canSubmit(){
			return constraints
				.every(({ key }) => fieldStatus[key]?.valid)
		},
		get submitting(){
			return submitting
		},
		get submissionError(){
			return submissionError
		},
		get(key){
			return data[key]
		},
		set(key, value, options={}){
			data[key] = value
			applyConstraints()

			if(!options.retainErrors)
				submissionError = undefined
				
			events.emit('change', { key, value })
			events.emit('update')
		},
		isValid(key){
			return fieldStatus[key]?.valid
		},
		async validate(){
			await applyConstraints(true)
			events.emit('update')

			if(!model.canSubmit)
				throw {
					expose: true,
					fields: fieldStatus
				}
		},
		async submit(f = submitFunc){
			if(!f)
				throw new Error(`no submission function given`)

			submitting = true
			events.emit('update')

			try{
				await model.validate()
				return await f(data)
			}catch(error){
				if(error.fields)
					Object.assign(fieldStatus, error.fields)

				submissionError = {
					...error,
					message: error.message
				}

				throw error
			}finally{
				submitting = false
				events.emit('update')
			}
		}
	}
}