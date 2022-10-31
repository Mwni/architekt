(function () {
	'use strict';

	const ctx = {};

	function render(scope, component, props){
		Object.assign(ctx, scope);

		let node = { 
			component,
			factory: component.factory,
			props
		};

		updateNodes([node], scope.node ? [scope.node] : undefined);

		Object.assign(ctx, { node });
	}

	function updateNodes(nodes, previousNodes, nextSibling){
		if(previousNodes === nodes || (!previousNodes && !nodes))
			return

		if(!previousNodes || previousNodes.length === 0){
			createNodes(nodes);
			return
		}

		if(!nodes || nodes.length === 0){
			removeNodes(previousNodes);
			return
		}

		let isPreviousKeyed = previousNodes[0] && previousNodes[0].key != null;
		let isKeyed = nodes[0] && nodes[0].key != null;

		let start = 0;
		let oldStart = 0;

		if(!isPreviousKeyed){
			while(oldStart < previousNodes.length && !previousNodes[oldStart]) 
				oldStart++;
		}

		if(!isKeyed){
			while(start < nodes.length && !nodes[start]) 
				start++;
		}

		if(isPreviousKeyed !== isKeyed){
			removeNodes(previousNodes.slice(oldStart));
			createNodes(nodes.slice(start));
		}else if(!isKeyed){
			let commonLength = previousNodes.length < nodes.length 
				? previousNodes.length 
				: nodes.length;
		
			start = start < oldStart ? start : oldStart;

			for (; start < commonLength; start++){
				let o = previousNodes[start];
				let v = nodes[start];

				if (o === v || (!o && !v))
					continue

				if(!o)
					createNode(v, getNextSibling(previousNodes, start + 1, nextSibling));
				else if(!v)
					removeNode(o);
				else
					updateNode(v, o, getNextSibling(previousNodes, start + 1, nextSibling));
			}

			if(previousNodes.length > commonLength)
				removeNodes(previousNodes.slice(start));

			if(nodes.length > commonLength)
				createNodes(nodes.slice(start));
		}else {
			throw Error(`Keyed diffing is not implemented.`)
			/*
			// keyed diff
			var oldEnd = old.length - 1, end = vnodes.length - 1, map, o, v, oe, ve, topSibling

			// bottom-up
			while (oldEnd >= oldStart && end >= start) {
				oe = old[oldEnd]
				ve = vnodes[end]
				if (oe.key !== ve.key) break
				if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns)
				if (ve.dom != null) nextSibling = ve.dom
				oldEnd--, end--
			}
			// top-down
			while (oldEnd >= oldStart && end >= start) {
				o = old[oldStart]
				v = vnodes[start]
				if (o.key !== v.key) break
				oldStart++, start++
				if (o !== v) updateNode(parent, o, v, hooks, getNextSibling(old, oldStart, nextSibling), ns)
			}
			// swaps and list reversals
			while (oldEnd >= oldStart && end >= start) {
				if (start === end) break
				if (o.key !== ve.key || oe.key !== v.key) break
				topSibling = getNextSibling(old, oldStart, nextSibling)
				moveDOM(parent, oe, topSibling)
				if (oe !== v) updateNode(parent, oe, v, hooks, topSibling, ns)
				if (++start <= --end) moveDOM(parent, o, nextSibling)
				if (o !== ve) updateNode(parent, o, ve, hooks, nextSibling, ns)
				if (ve.dom != null) nextSibling = ve.dom
				oldStart++; oldEnd--
				oe = old[oldEnd]
				ve = vnodes[end]
				o = old[oldStart]
				v = vnodes[start]
			}
			// bottom up once again
			while (oldEnd >= oldStart && end >= start) {
				if (oe.key !== ve.key) break
				if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns)
				if (ve.dom != null) nextSibling = ve.dom
				oldEnd--, end--
				oe = old[oldEnd]
				ve = vnodes[end]
			}
			if (start > end) removeNodes(parent, old, oldStart, oldEnd + 1)
			else if (oldStart > oldEnd) createNodes(parent, vnodes, start, end + 1, hooks, nextSibling, ns)
			else {
				// inspired by ivi https://github.com/ivijs/ivi/ by Boris Kaul
				var originalNextSibling = nextSibling, vnodesLength = end - start + 1, oldIndices = new Array(vnodesLength), li=0, i=0, pos = 2147483647, matched = 0, map, lisIndices
				for (i = 0; i < vnodesLength; i++) oldIndices[i] = -1
				for (i = end; i >= start; i--) {
					if (map == null) map = getKeyMap(old, oldStart, oldEnd + 1)
					ve = vnodes[i]
					var oldIndex = map[ve.key]
					if (oldIndex != null) {
						pos = (oldIndex < pos) ? oldIndex : -1 // becomes -1 if nodes were re-ordered
						oldIndices[i-start] = oldIndex
						oe = old[oldIndex]
						old[oldIndex] = null
						if (oe !== ve) updateNode(parent, oe, ve, hooks, nextSibling, ns)
						if (ve.dom != null) nextSibling = ve.dom
						matched++
					}
				}
				nextSibling = originalNextSibling
				if (matched !== oldEnd - oldStart + 1) removeNodes(parent, old, oldStart, oldEnd + 1)
				if (matched === 0) createNodes(parent, vnodes, start, end + 1, hooks, nextSibling, ns)
				else {
					if (pos === -1) {
						// the indices of the indices of the items that are part of the
						// longest increasing subsequence in the oldIndices list
						lisIndices = makeLisIndices(oldIndices)
						li = lisIndices.length - 1
						for (i = end; i >= start; i--) {
							v = vnodes[i]
							if (oldIndices[i-start] === -1) createNode(parent, v, hooks, ns, nextSibling)
							else {
								if (lisIndices[li] === i - start) li--
								else moveDOM(parent, v, nextSibling)
							}
							if (v.dom != null) nextSibling = vnodes[i].dom
						}
					} else {
						for (i = end; i >= start; i--) {
							v = vnodes[i]
							if (oldIndices[i-start] === -1) createNode(parent, v, hooks, ns, nextSibling)
							if (v.dom != null) nextSibling = vnodes[i].dom
						}
					}
				}
			}*/
		}
	}


	function createNodes(nodes, nextSibling){
		for(let node of nodes){
			if(!node)
				continue

			createNode(node);
		}
	}

	function createNode(node, nextSibling){
		if(node.element){
			createElement$1(node);
		}else if(node.factory){
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
		
		ctx.setAttrs(node, node.attrs);
		ctx.insertElement(ctx.parentDom, node.dom, ctx.nextSibling);
	}

	function createComponent(node){
		node.state = {};
		node.instance = [];

		ctx.node = node;
		ctx.stack = [];

		node.render = node.factory(node.props);
		node.render(node.props);
		node.instance = ctx.stack;

		if(node.instance.length === 1){
			createNode(node.instance[0]);
			node.dom = node.instance[0].dom;
		}
	}


	function updateNode(node, previousNode, nextSibling){
		if (node.factory === previousNode.factory){
			node.render = previousNode.render;
			node.state = previousNode.state;
			node.events = previousNode.events;

			//if(shouldNotUpdate(node, previousNode)) 
			//	return

			if(previousNode.element){
				updateElement(node, previousNode);
			}else {
				updateComponent(node, previousNode);
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

				updateNodes(node.children, previousNode.children, null);
		
				ctx.parentDom = previousParentDom;
			}

			//hack
			Object.assign(previousNode, node);
		}else {
			removeNode(previousNode);
			createNode(node);
		}
	}

	function updateElement(node, previousNode){
		node.dom = previousNode.dom;
		ctx.setAttrs(node, node.attrs, previousNode.attrs);
	}

	function updateComponent(node, previousNode, nextSibling){
		ctx.node = node;
		ctx.stack = [];

		node.render(node.props);
		node.instance = ctx.stack;

		//updateLifecycle(vnode.state, vnode, hooks)

		if(!previousNode.instance)
			createNode(node.instance[0]);
		else
			updateNode(node.instance[0], previousNode.instance[0]);

		node.dom = node.instance[0].dom;
	}

	function removeNodes(nodes){
		for(let node of nodes){
			if(!node)
				continue

			removeNode(node);
		}
	}

	function removeNode(node){
		if(node.dom)
			ctx.removeElement(node.dom);
	}


	function getNextSibling(nodes, startIndex, nextSibling){
		for(let i=startIndex; i<nodes.length; i++){
			if(nodes[i] && nodes[i].dom) 
				return nodes[i].dom
		}

		return nextSibling
	}

	var Component = factory => {
		let component = (props, content) => {
			if(!props){
				props = {};
			}else if(typeof props === 'function' && !content){
				content = props;
				props = {};
			}

			ctx.stack.push({
				component,
				factory,
				props,
				content
			});
		};

		component.factory = factory;

		return component
	};

	function getContext(){
		let scope = { ...ctx };

		return {
			redraw: () => {
				render(scope, scope.node.component, scope.node.props);
			}
		}
	}

	const VStack = (...args) => ctx.components.VStack(...args);
	const Headline = (...args) => ctx.components.Headline(...args);
	const Text = (...args) => ctx.components.Text(...args);
	const Button = (...args) => ctx.components.Button(...args);

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

	function removeElement(element){
		element.parentNode.removeChild(element);
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

		if(previousAttrs){
			let val;

			for(let key in previousAttrs) {
				if (((val = previousAttrs[key]) != null) && (attrs == null || attrs[key] == null)) {
					removeAttr(node, key, val);
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


	class EventDict{
		constructor(){
			this._ = null;
		}

		handleEvent(event){
			let handler = this['on' + event.type];
			let result;

			if(typeof handler === 'function') 
				result = handler.call(event.currentTarget, event);

			else if(typeof handler.handleEvent === 'function') 
				handler.handleEvent(event);

			if (this._ && event.redraw !== false) (0, this._)();

			if(result === false){
				event.preventDefault();
				event.stopPropagation();
			}
		}
	}



	function updateEvent(node, key, value) {
		if(node.events){
			node.events._ = null;

			if(node.events[key] === value)
				return

			if(value && (typeof value === 'function' || typeof value === 'object')){
				if(node.events[key] == null) 
					node.dom.addEventListener(key.slice(2), node.events, false);

				node.events[key] = value;
			}else {
				if(node.events[key] != null) 
					node.dom.removeEventListener(key.slice(2), node.events, false);

				node.events[key] = undefined;
			}
		}else if(value != null && (typeof value === 'function' || typeof value === 'object')){
			node.events = new EventDict();
			node.dom.addEventListener(key.slice(2), node.events, false);
			node.events[key] = value;
		}
	}

	var vstack = Component(
		() => {

			return ({ gap, content }) => {
				Element('div', {class: 'a-vstack'}, content);
			}
		});

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

	var button = Component(
		() => {

			return ({ text, action }, content) => {
				Element(
					'button', 
					{
						class: 'a-button',
						onclick: action
					}, 
					text ? text : content
				);
			}
		}
	);

	var components = /*#__PURE__*/Object.freeze({
		__proto__: null,
		VStack: vstack,
		Headline: headline,
		Text: text,
		Button: button
	});

	function mount(dom, component, props){
		let ctx = {
			components,
			createElement, 
			insertElement,
			removeElement,
			setAttrs,
			parentDom: dom
		};

		render(ctx, component, props);
	}

	const Welcome = Component(({ name }) => {
		let { redraw } = getContext();
		let clicks = 0;

		console.log('i am constructed');

		return ({ name }) => {
			VStack(() => {
				Headline({ text: `Hi, ${name}` });
				
				for(let i=0; i<(clicks%5)+1; i++){
					Text({ text: `You clicked ${clicks} times!` });
				}

				Button({
					text: 'Click',
					action: event => {
						console.log('clicked');
						clicks++;
						redraw();
					}
				});
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
