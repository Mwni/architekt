import { ctx } from '@architekt/engine'

export const Element = (tag, attrs, content) => {
	if(typeof content === 'string'){
		attrs.textContent = content
		content = undefined
	}

	ctx.stack.push({ element: tag, attrs, content })
}

export function createElement(tag){
	return document.createElement(tag)
}

export function insertElement(parent, element, nextSibling){
	if(nextSibling)
		parent.insertBefore(element, nextSibling)
	else
		parent.appendChild(element)
}

export function removeElement(element){
	element.parentNode.removeChild(element)
}

export function setAttrs(node, attrs, previousAttrs){
	if(attrs){
		let isInput = node.element === 'input'
		let isFileInput = isInput && attrs.type === 'file'

		if(isInput && attrs.type != null){
			// The browser does things to inputs based on the value, so it needs to be set first.
			node.dom.setAttribute('type', attrs.type)
		}
		
		for (let key in attrs) {
			setAttr(node, key, previousAttrs?.[key], attrs[key], isFileInput)
		}
	}

	if(previousAttrs){
		let val

		for(let key in previousAttrs) {
			if (((val = previousAttrs[key]) != null) && (attrs == null || attrs[key] == null)) {
				removeAttr(node, key, val)
			}
		}
	}
}

function setAttr(node, key, old, value, isFileInput) {
	if(key === 'key' || value == null || (old === value && !isFormAttribute(node, key)) && typeof value !== 'object' || key === 'type' && node.tag === 'input') 
		return
	
	if(key.startsWith('on')) 
		return updateEvent(node, key, value)

	if(key.slice(0, 6) === 'xlink:') 
		node.dom.setAttributeNS('http://www.w3.org/1999/xlink', key.slice(6), value)

	else if(key === 'style') 
		updateStyle(node.dom, old, value)

	else if(hasPropertyKey(node, key)){
		if(key === 'value'){
			// Setting input[value] to same value by typing on focused element moves cursor to end in Chrome.
			// Setting input[type=file][value] to same value causes an error to be generated if it's non-empty.
			if((node.tag === 'input' || node.tag === 'textarea') && node.dom.value === '' + value && (isFileInput || node.dom === activeElement())) 
				return

			// Setting select[value] to same value while having select open blinks select dropdown in Chrome.
			if(node.tag === 'select' && old !== null && node.dom.value === '' + value) 
				return

			// Setting option[value] to same value while having select open blinks select dropdown in Chrome.
			if(node.tag === 'option' && old !== null && node.dom.value === '' + value) 
				return

			// Setting input[type=file][value] to different value is an error if it's non-empty.
			// Not ideal, but it at least works around the most common source of uncaught exceptions for now.
			if(isFileInput && value.toString() !== '') { 
				console.error('`value` is read-only on file inputs!')
				return 
			}
		}

		node.dom[key] = value
	}else{
		if(typeof value === 'boolean'){
			if (value) 
				node.dom.setAttribute(key, '')
			else 
				node.dom.removeAttribute(key)
		}else{
			node.dom.setAttribute(key === 'className' ? 'class' : key, value)
		}
	}
}

function removeAttr(node, key, old) {
	if(key === 'key' || key === 'is' || old == null) 
		return

	if(key[0] === 'o' && key[1] === 'n') 
		updateEvent(node, key, undefined)

	else if(key === 'style') 
		updateStyle(node.dom, old, null)

	else if (
		hasPropertyKey(node, key)
		&& key !== 'className'
		&& key !== 'title' // creates 'null' as title
		&& !(key === 'value' && (
			node.tag === 'option'
			|| node.tag === 'select' && node.dom.selectedIndex === -1 && vnode.dom === activeElement()
		))
		&& !(node.tag === 'input' && key === 'type')
	){
		node.dom[key] = null
	}else{
		let nsLastIndex = key.indexOf(':')

		if(nsLastIndex !== -1) 
			key = key.slice(nsLastIndex + 1)

		if(old !== false) 
			node.dom.removeAttribute(key === 'className' ? 'class' : key)
	}
}

function isFormAttribute(vnode, attr) {
	return attr === 'value' || attr === 'checked' || attr === 'selectedIndex' || attr === 'selected' && vnode.dom === activeElement() || vnode.tag === 'option' && vnode.dom.parentNode === $doc.activeElement
}

function hasPropertyKey(vnode, key) {
	// Filter out namespaced keys
	return(
		// If it's a custom element, just keep it.
		vnode.element.indexOf('-') > -1 || vnode.attrs != null && vnode.attrs.is ||
		// If it's a normal element, let's try to avoid a few browser bugs.
		key !== 'href' && key !== 'list' && key !== 'form' && key !== 'width' && key !== 'height'// && key !== 'type'
		// Defer the property check until *after* we check everything.
	) && key in vnode.dom
}

var uppercaseRegex = /[A-Z]/g
function toLowerCase(capital) { return '-' + capital.toLowerCase() }
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



function updateEvent(node, key, value) {
	if(node.events){
		node.events._ = null

		if(node.events[key] === value)
			return

		if(value && (typeof value === 'function' || typeof value === 'object')){
			if(node.events[key] == null) 
				node.dom.addEventListener(key.slice(2), node.events, false)

			node.events[key] = value
		}else{
			if(node.events[key] != null) 
				node.dom.removeEventListener(key.slice(2), node.events, false)

			node.events[key] = undefined
		}
	}else if(value != null && (typeof value === 'function' || typeof value === 'object')){
		node.events = new EventDict()
		node.dom.addEventListener(key.slice(2), node.events, false)
		node.events[key] = value
	}
}