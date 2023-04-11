export function setAttrs(element, attrs, previousAttrs){
	if(attrs){
		let isInput = element.tagName === 'INPUT'
		let isFileInput = isInput && attrs.type === 'file'

		if(isInput && attrs.type != null){
			// The browser does things to inputs based on the value, so it needs to be set first.
			element.setAttribute('type', attrs.type)
		}
		
		for (let key in attrs) {
			setAttr(element, key, previousAttrs?.[key], attrs[key], isFileInput)
		}
	}

	if(previousAttrs){
		let val

		for(let key in previousAttrs) {
			if (((val = previousAttrs[key]) != null) && (attrs == null || attrs[key] == null)) {
				removeAttr(element, key, val)
			}
		}
	}
}

function setAttr(element, key, old, value, isFileInput) {
	if(value === undefined){
		element.removeAttribute(key)
		return
	}

	if(key === 'ctx' || (old === value && !isFormAttribute(element, key)) && typeof value !== 'object' || (key === 'type' && element.tagName === 'INPUT')) 
		return
	
	if(key.startsWith('on')) 
		return updateEvent(element, key, value)

	if(key.slice(0, 6) === 'xlink:') 
		element.setAttributeNS('http://www.w3.org/1999/xlink', key.slice(6), value)

	else if(key === 'style') 
		updateStyle(element, old, value)

	else if(hasPropertyKey(element, key)){
		if(key === 'value'){
			// Setting input[value] to same value by typing on focused element moves cursor to end in Chrome.
			// Setting input[type=file][value] to same value causes an error to be generated if it's non-empty.
			if((element.tag === 'INPUT' || element.tag === 'TEXTAREA') && element.value === '' + value && (isFileInput || element === activeElement())) 
				return

			// Setting select[value] to same value while having select open blinks select dropdown in Chrome.
			if(element.tag === 'SELECT' && old !== null && element.value === '' + value) 
				return

			// Setting option[value] to same value while having select open blinks select dropdown in Chrome.
			if(element.tag === 'OPTION' && old !== null && element.value === '' + value) 
				return

			// Setting input[type=file][value] to different value is an error if it's non-empty.
			// Not ideal, but it at least works around the most common source of uncaught exceptions for now.
			if(isFileInput && value.toString() !== '') { 
				console.error('`value` is read-only on file inputs!')
				return 
			}
		}

		element[key] = value
	}else{
		if(typeof value === 'boolean'){
			if (value) 
				element.setAttribute(key, '')
			else 
				element.removeAttribute(key)
		}else{
			element.setAttribute(key === 'className' ? 'class' : key, value)
		}
	}
}

function removeAttr(element, key, old) {
	if(key === 'key' || key === 'is' || old == null) 
		return

	if(key[0] === 'o' && key[1] === 'n') 
		updateEvent(element, key, undefined)

	else if(key === 'style') 
		updateStyle(element.dom, old, null)

	else if (
		hasPropertyKey(element, key)
		&& key !== 'className'
		&& key !== 'title' // creates 'null' as title
		&& !(key === 'value' && (
			element.tagName === 'OPTION'
			|| element.tagName === 'SELECT' && element.selectedIndex === -1 && element === activeElement()
		))
		&& !(element.tagName === 'INPUT' && key === 'type')
	){
		element[key] = null
	}else{
		let nsLastIndex = key.indexOf(':')

		if(nsLastIndex !== -1) 
			key = key.slice(nsLastIndex + 1)

		if(old !== false) 
			element.removeAttribute(key === 'className' ? 'class' : key)
	}
}

function isFormAttribute(element, attr) {
	return attr === 'value' || attr === 'checked' || attr === 'selectedIndex' || attr === 'selected' && element === activeElement() || element.tagName === 'OPTION' && element.parentNode === $doc.activeElement
}

function activeElement(){
	return window.activeElement
}

function hasPropertyKey(element, key) {
	// Filter out namespaced keys
	return(
		// If it's a custom element, just keep it.
		element.tagName.indexOf('-') > -1 ||
		// If it's a normal element, let's try to avoid a few browser bugs.
		key !== 'href' && key !== 'list' && key !== 'form' && key !== 'width' && key !== 'height'// && key !== 'type'
		// Defer the property check until *after* we check everything.
	) && key in element
}

const uppercaseRegex = /[A-Z]/g

function toLowerCase(capital) { 
	return '-' + capital.toLowerCase()
}

function normalizeKey(key) {
	return key[0] === '-' && key[1] === '-' ? key :
		key === 'cssFloat' ? 'float' :
			key.replace(uppercaseRegex, toLowerCase)
}

function updateStyle(element, old, style) {
	if (old === style) {
		// Styles are equivalent, do nothing.
	} else if (style == null) {
		// New style is missing, just clear it.
		element.style.cssText = ''
	} else if (typeof style !== 'object') {
		// New style is a string, let engine deal with patching.
		element.style.cssText = style
	} else if (old == null || typeof old !== 'object') {
		// `old` is missing or a string, `style` is an object.
		element.style.cssText = ''
		// Add new style properties
		for (var key in style) {
			var value = style[key]
			if (value != null) element.style.setProperty(normalizeKey(key), String(value))
		}
	} else {
		// Both old & new are (different) objects.
		// Update style properties that have changed
		for (var key in style) {
			var value = style[key]
			if (value != null && (value = String(value)) !== String(old[key])) {
				element.style.setProperty(normalizeKey(key), value)
			}
		}
		// Remove style properties that no longer exist
		for (var key in old) {
			if (old[key] != null && style[key] == null) {
				element.style.removeProperty(normalizeKey(key))
			}
		}
	}
}


class EventDict{
	constructor(){
		this._ = null
	}

	handleEvent(event){
		let handler = this['on' + event.type]
		let result

		if(typeof handler === 'function') 
			result = handler.call(event.currentTarget, event)

		else if(typeof handler.handleEvent === 'function') 
			handler.handleEvent(event)

		if (this._ && event.redraw !== false) (0, this._)()

		if(result === false){
			event.preventDefault()
			event.stopPropagation()
		}
	}
}

function updateEvent(element, key, value) {
	if(element.events){
		element.events._ = null

		if(element.events[key] === value)
			return

		if(value && (typeof value === 'function' || typeof value === 'object')){
			if(element.events[key] == null) 
			element.addEventListener(key.slice(2), element.events, false)

			element.events[key] = value
		}else{
			if(element.events[key] != null) 
			element.removeEventListener(key.slice(2), element.events, false)

			element.events[key] = undefined
		}
	}else if(value != null && (typeof value === 'function' || typeof value === 'object')){
		element.events = new EventDict()
		element.addEventListener(key.slice(2), element.events, false)
		element.events[key] = value
	}
}