(function () {
	'use strict';

	const ctx = {};

	function create({ ctx: entryCtx, component, props }){
		let node = {
			props,
			factory: () => () => component(props)
		};

		Object.assign(ctx, entryCtx, { node });
		
		render([node]);

		console.log(node);
	}


	function render(nodes){
		createNodes(nodes);
	}


	function createNodes(nodes){
		for(let node of nodes){
			if(!node)
				continue

			createNode(node);
		}
	}

	function createNode(node){
		if(node.element){
			console.log('create element', node.element);
			createElement$1(node);
		}else if(node.factory){
			console.log('create component', node.factory);
			createComponent(node);
		}

		if(node.content){
			if(typeof node.content !== 'function'){
				throw new Error(`Component's content parameter must either be a closure or left blank, not ${typeof node.content}`)
			}

			ctx.stack = [];

			node.content();
			node.children = ctx.stack;

			let previousParentDom = ctx.parentDom;

			ctx.parentDom = node.dom;

			createNodes(node.children);

			ctx.parentDom = previousParentDom;
		}
	}

	function createElement$1(node){
		node.dom = ctx.createElement(node.element);

		console.log('set attrs:', node);
		
		ctx.setAttrs(node, node.attrs);
		ctx.insertElement(ctx.parentDom, node.dom, ctx.nextSibling);

		console.log('set', ctx.parentDom);
	}

	function createComponent(node){
		node.state = {};
		node.instance = [];

		ctx.node = node;
		ctx.stack = [];

		let render = node.factory(node.props);

		render(node.props);

		node.instance = ctx.stack;

		console.log('created component', node);

		if(node.instance.length === 1){
			createNode(node.instance[0]);
			node.dom = node.instance[0].dom;
		}
	}

	var Component = (factory, meta) => {

		return (props, content) => {
			if(!props){
				props = {};
			}else if(typeof props === 'function' && !content){
				content = props;
				props = {};
			}

			ctx.stack.push({
				meta,
				factory,
				props,
				content
			});
		}
	};

	const VStack = (...args) => ctx.components.VStack(...args);
	const Headline = (...args) => ctx.components.Headline(...args);
	const Text = (...args) => ctx.components.Text(...args);

	const Element = (tag, attrs, content) => {
		if(typeof content === 'string'){
			attrs.textContent = content;
			content = undefined;
		}

		ctx.stack.push({ element: tag, attrs, content });
	};

	function createElement(tag){
		return document.createElement(tag)
	}

	function insertElement(parent, element, nextSibling){
		if(nextSibling)
			parent.insertBefore(element, nextSibling);
		else
			parent.appendChild(element);
	}

	function setAttrs(node, attrs, previousAttrs){
		if(attrs){
			let isInput = node.element === 'input';
			let isFileInput = isInput && attrs.type === 'file';

			if(isInput && attrs.type != null){
				// The browser does things to inputs based on the value, so it needs to be set first.
				node.dom.setAttribute('type', attrs.type);
			}
			
			for (let key in attrs) {
				setAttr(node, key, previousAttrs?.[key], attrs[key], isFileInput);
			}
		}

		let val;

		if(previousAttrs){
			for(let key in previousAttrs) {
				if (((val = previousAttrs[key]) != null) && (attrs == null || attrs[key] == null)) {
					removeAttr(node, key, val);
				}
			}
		}
	}


	function setAttr(node, key, old, value, isFileInput) {
		if(key === 'key' || key === 'is' || value == null || (old === value && !isFormAttribute(node, key)) && typeof value !== 'object' || key === 'type' && node.tag === 'input') 
			return
		
		if(key[0] === 'o' && key[1] === 'n') 
			return updateEvent(node, key, value)


		if(key.slice(0, 6) === 'xlink:') 
			node.dom.setAttributeNS('http://www.w3.org/1999/xlink', key.slice(6), value);

		else if(key === 'style') 
			updateStyle(node.dom, old, value);

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
					console.error('`value` is read-only on file inputs!');
					return 
				}
			}

			node.dom[key] = value;
		}else {
			if(typeof value === 'boolean'){
				if (value) 
					node.dom.setAttribute(key, '');
				else 
					node.dom.removeAttribute(key);
			}else {
				node.dom.setAttribute(key === 'className' ? 'class' : key, value);
			}
		}
	}

	function removeAttr(node, key, old) {
		if(key === 'key' || key === 'is' || old == null) 
			return

		if(key[0] === 'o' && key[1] === 'n') 
			updateEvent(node, key, undefined);

		else if(key === 'style') 
			updateStyle(node.dom, old, null);

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
			node.dom[key] = null;
		}else {
			let nsLastIndex = key.indexOf(':');

			if(nsLastIndex !== -1) 
				key = key.slice(nsLastIndex + 1);

			if(old !== false) 
				node.dom.removeAttribute(key === 'className' ? 'class' : key);
		}
	}

	function isFormAttribute(vnode, attr) {
		return attr === 'value' || attr === 'checked' || attr === 'selectedIndex' || attr === 'selected' && vnode.dom === activeElement() || vnode.tag === 'option' && vnode.dom.parentNode === $doc.activeElement
	}

	function hasPropertyKey(vnode, key) {
		// Filter out namespaced keys
		return (
			// If it's a custom element, just keep it.
			vnode.element.indexOf('-') > -1 || vnode.attrs != null && vnode.attrs.is ||
			// If it's a normal element, let's try to avoid a few browser bugs.
			key !== 'href' && key !== 'list' && key !== 'form' && key !== 'width' && key !== 'height'// && key !== 'type'
			// Defer the property check until *after* we check everything.
		) && key in vnode.dom
	}

	var uppercaseRegex = /[A-Z]/g;
	function toLowerCase(capital) { return '-' + capital.toLowerCase() }
	function normalizeKey(key) {
		return key[0] === '-' && key[1] === '-' ? key :
			key === 'cssFloat' ? 'float' :
				key.replace(uppercaseRegex, toLowerCase)
	}
	function updateStyle(element, old, style) {
		if (old === style) ; else if (style == null) {
			// New style is missing, just clear it.
			element.style.cssText = '';
		} else if (typeof style !== 'object') {
			// New style is a string, let engine deal with patching.
			element.style.cssText = style;
		} else if (old == null || typeof old !== 'object') {
			// `old` is missing or a string, `style` is an object.
			element.style.cssText = '';
			// Add new style properties
			for (var key in style) {
				var value = style[key];
				if (value != null) element.style.setProperty(normalizeKey(key), String(value));
			}
		} else {
			// Both old & new are (different) objects.
			// Update style properties that have changed
			for (var key in style) {
				var value = style[key];
				if (value != null && (value = String(value)) !== String(old[key])) {
					element.style.setProperty(normalizeKey(key), value);
				}
			}
			// Remove style properties that no longer exist
			for (var key in old) {
				if (old[key] != null && style[key] == null) {
					element.style.removeProperty(normalizeKey(key));
				}
			}
		}
	}

	// Here's an explanation of how this works:
	// 1. The event names are always (by design) prefixed by `on`.
	// 2. The EventListener interface accepts either a function or an object
	//    with a `handleEvent` method.
	// 3. The object does not inherit from `Object.prototype`, to avoid
	//    any potential interference with that (e.g. setters).
	// 4. The event name is remapped to the handler before calling it.
	// 5. In function-based event handlers, `ev.target === this`. We replicate
	//    that below.
	// 6. In function-based event handlers, `return false` prevents the default
	//    action and stops event propagation. We replicate that below.
	function EventDict() {
		// Save this, so the current redraw is correctly tracked.
		this._ = currentRedraw;
	}
	EventDict.prototype = Object.create(null);
	EventDict.prototype.handleEvent = function (ev) {
		var handler = this['on' + ev.type];
		var result;
		if (typeof handler === 'function') result = handler.call(ev.currentTarget, ev);
		else if (typeof handler.handleEvent === 'function') handler.handleEvent(ev);
		if (this._ && ev.redraw !== false) (0, this._)();
		if (result === false) {
			ev.preventDefault();
			ev.stopPropagation();
		}
	};

	//event
	function updateEvent(vnode, key, value) {
		if (vnode.events != null) {
			vnode.events._ = currentRedraw;
			if (vnode.events[key] === value) return
			if (value != null && (typeof value === 'function' || typeof value === 'object')) {
				if (vnode.events[key] == null) vnode.dom.addEventListener(key.slice(2), vnode.events, false);
				vnode.events[key] = value;
			} else {
				if (vnode.events[key] != null) vnode.dom.removeEventListener(key.slice(2), vnode.events, false);
				vnode.events[key] = undefined;
			}
		} else if (value != null && (typeof value === 'function' || typeof value === 'object')) {
			vnode.events = new EventDict();
			vnode.dom.addEventListener(key.slice(2), vnode.events, false);
			vnode.events[key] = value;
		}
	}

	var vstack = Component(
		() => {

			return ({ gap, content }) => {
				Element('div', {class: 'a-vstack'}, content);
			}
		},
		{tag: 'vstack'}
	);

	var headline = Component(
		() => {

			return ({ text }) => {
				Element('h1', {class: 'a-headline'}, text);
			}
		}
	);

	var text = Component(
		() => {

			return ({ text }) => {
				Element('span', {class: 'a-text'}, text);
			}
		}
	);

	var components = /*#__PURE__*/Object.freeze({
		__proto__: null,
		VStack: vstack,
		Headline: headline,
		Text: text
	});

	function mount(dom, component, props){
		create({
			ctx: {
				components,
				createElement, 
				insertElement,
				setAttrs,
				parentDom: dom
			},
			component,
			props,
		});
	}

	const Welcome = Component(({ name }) => {
		/*let { app, state, didCreate } = getContext()
		
		state.default({
			name,
			happy: undefined
		})
		

		didCreate(dom => {
			dom.style.opacity = 0.5
			app.notify()
		})*/

		return ({ name }) => {
			VStack(() => {
				Headline({ text: `Hi, ${name}` });
				Text({ text: 'How are you today?' });
				/*Button({
					action: event => getContext().state.apply({ happy: true })
				})*/
			});
		}
	});

	mount(document.body, Welcome, { name: 'Alice' });

	/*
	const Welcome2 = Component(({ app, props, state, didCreate }) => {
		state.default({
			name: props.name,
			happy: undefined
		})

		didCreate(dom => {
			dom.style.opacity = 0.5
			app.notify()
		})

		return ({ props }) => {
			VStack(ctx => {
				Headline({ text: `Hi, ${props.name}` })
				Text({ text: 'How are you today?' })
				Button({
					action: event => ctx.state.apply({ happy: true })
				})
			})
		}
	})


	const Headline = ({ text }) => {

		return ({ text }) => {

		}
	}

	class Welcome3 extends Component{
		view({ name }){
			VStack(() => {
				Headline({ text: `Hi, ${name}` })
				Text({ text: 'How are you today?' })
			})
		}
	}*/

})();
