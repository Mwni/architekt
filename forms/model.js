import { createEmitter } from '@mwni/events'

export default ({ data: initalData, constraints }) => {
	let data = { ...initalData }
	let events = createEmitter()

	return {
		...events,
		get(key){
			return data[key]
		},
		set(key, value){
			data[key] = value
			events.emit('change', { key, value })
		}
	}
}