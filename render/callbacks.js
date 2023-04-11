export function registerCallback(node, type, callback){
	if(!node.callbacks)
		node.callbacks = []

	node.callbacks.push({ type, callback })
}

export function dispatchCallbacks(node, type, value){
	if(!node.callbacks)
		return

	for(let i=0; i<node.callbacks.length; i++){
		let e = node.callbacks[i]

		if(e.type === type){
			node.callbacks.splice(i, 1)
			e.callback(value)
			i--
		}
	}
}