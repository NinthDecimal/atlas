//jshint strict:false
(function(global){

var Atlas, Element, Elements, badProto, ElProto, constructor, ie7Hack, ElsProto,
	oListeners, runListeners, getCompatElement;

Atlas = global.Atlas;
if (!Atlas || !document) return;


Atlas.extend(document, {
	/*

		@api: document.id

		@notes: Stolen from MooTools

		@arguments: String, Element or Class with toElement property

		@returns: valid element or null

	*/
	id: function(el){
		var type = Atlas.typeOf(el);

		if (type === 'string') el = document.getElementById(el) || null;
		if (type === 'class' && el.toElement) el = el.toElement();
		if (el && el.nodeType !== 1) el = null;
		if (el && !el.__extended__) Atlas.extend(el, ElProto, true);

		return el || null;
	},

	getDocument: function(){
		return this;
	}

}, true);


/*

	@api: new Element

	@notes: API inspired by MooTools

	@arguments: String(html tag), [optional: Object(properties)]

	@returns: a new HTML element, extended with specified properties

*/

Element = function(tag, options){
	var el = document.createElement(tag || 'div');
	if (!el.__extended__) Atlas.extend(el, ElProto, true);
	el.set(options);
	return el;
};

constructor = window.Element || Element;
badProto = (Element === constructor);

// Add type
new Atlas.Type('element', Element, true);

Atlas.extend(document, '__type__', 'document');

// Preserving a reference to the actual element constructor
Atlas.extend(Element, 'constructor', constructor);


/*

	@api: new Elements

	@notes: A constructor to manage multiple elements at once in an
	array like object

	@arguments: Any numer of elements or arrays of elements

	@returns: a type Elements array like object

*/

Elements = function Element(){
	var args = Array.from(arguments).flatten(),
		self = (ie7Hack) ? [] : this;

	args.each(function(el){
		el = document.id(el);
		if (!el) return;
		self.push(el);
	});

	// @block: ie
	if (ie7Hack){
		Atlas.extend(self, ElsProto, true);
		Atlas.extend(self, '__type__', 'elements');
	}
	// @end

	return self;
};

ElsProto = {};

	// IE7 Hack...
	// Because we cannot subclass Array, we completely break
	// the Elements constructor. This allows it to actually still work
ie7Hack = (document.all && (!document.documentMode || (document.documentMode && document.documentMode < 8))) ? true : false;

// Elements is essentially an extended Array, so we inherit
// from Array first
Elements.prototype = [];

// Add Elements type
new Atlas.Type('elements', Elements);

// @block: ie
// Utilities for add|removeEventListener shim
oListeners = {};
runListeners = function(oEvent) {
	if (!oEvent) { oEvent = window.event; }
	for (var iLstId = 0, iElId = 0, oEvtListeners = oListeners[oEvent.type]; iElId < oEvtListeners.aEls.length; iElId++) {
		if (oEvtListeners.aEls[iElId] === this) {
			for (iLstId; iLstId < oEvtListeners.aEvts[iElId].length; iLstId++){
				oEvtListeners.aEvts[iElId][iLstId].call(this, oEvent);
			}
			break;
		}
	}
};

// Quick and dirty shim for getComputedStyle
Atlas.extend(global, {

	getComputedStyle: function(el) {
		this.el = el;
		this.getPropertyValue = function(prop) {
			var re = /(\-([a-z]){1})/g;
			if (prop == 'float') prop = 'styleFloat';
			if (re.test(prop)) {
				prop = prop.replace(re, function () {
					return arguments[2].toUpperCase();
				});
			}
			return el.currentStyle[prop] ? el.currentStyle[prop] : null;
		};

		return this;
	}

}, true);
// @end


// Element Prototype
ElProto = {

	__extended__: true,

	getDocument: function(){
		return this.ownerDocument;
	},

	// @block: ie
	addEventListener: function(sEventType, fListener) { // Shim
		var oEvtListeners, nElIdx, iElId, aElListeners, iLstId;
		if (oListeners.hasOwnProperty(sEventType)) {
			oEvtListeners = oListeners[sEventType];
			for (nElIdx = -1, iElId = 0; iElId < oEvtListeners.aEls.length; iElId++) {
				if (oEvtListeners.aEls[iElId] === this) { nElIdx = iElId; break; }
			}
			if (nElIdx === -1) {
				oEvtListeners.aEls.push(this);
				oEvtListeners.aEvts.push([fListener]);
				this['on' + sEventType] = runListeners;
			} else {
				aElListeners = oEvtListeners.aEvts[nElIdx];
				if (this['on' + sEventType] !== runListeners) {
					aElListeners.splice(0);
					this['on' + sEventType] = runListeners;
				}
				for (iLstId = 0; iLstId < aElListeners.length; iLstId++) {
					if (aElListeners[iLstId] === fListener) { return; }
				}
				aElListeners.push(fListener);
			}
		} else {
			oListeners[sEventType] = { aEls: [this], aEvts: [ [fListener] ] };
			this['on' + sEventType] = runListeners;
		}
	},

	removeEventListener: function (sEventType, fListener) { // Shim
		var oEvtListeners, nElIdx, iElId, iLstId, aElListeners;
		if (!oListeners.hasOwnProperty(sEventType)) { return; }
		oEvtListeners = oListeners[sEventType];
		for (nElIdx = -1, iElId = 0; iElId < oEvtListeners.aEls.length; iElId++) {
			if (oEvtListeners.aEls[iElId] === this) { nElIdx = iElId; break; }
		}
		if (nElIdx === -1) { return; }
		for (iLstId = 0, aElListeners = oEvtListeners.aEvts[nElIdx]; iLstId < aElListeners.length; iLstId++) {
			if (aElListeners[iLstId] === fListener) { aElListeners.splice(iLstId, 1); }
		}
	},

	// Simple Shim
	hasAttribute: function(attr){
		var value = this.getAttribute(attr);
		return Atlas.typeOf(value) === 'null' ? false : true;
	},
	// @end

	getElement: function(query){
		return document.id(this.querySelectorAll(query)[0]);
	},

	getElements: function(query){
		return new Elements(this.querySelectorAll(query));
	},

	set: (function(key, value){
		value = (value || value !== 0) ? value : '';
		if (key === 'html') key = 'innerHTML';
		switch(key){
			case 'class':
				this.className = value;
			break;

			case 'events':
				this.addEvents(value);
			break;

			case 'style':
				this.setStyles(value);
			break;

			case 'styles':
				this.setStyles(value);
			break;

			case 'innerHTML':
				this.innerHTML = value;
			break;

			default:
				this.setAttribute(key, value || '');
			break;
		}

		return this;
	}).overloadSetter(),

	get: (function(value){
		return this.getAttribute(value) || this[value] || null;
	}).overloadGetter(),

	setStyle: function(key, value){
		this.style[key.camelCase()] = value;
		return this;
	},

	getStyle: function(style){
		var result;

		if (window.getComputedStyle)
			result = window.getComputedStyle(this).getPropertyValue(style);

		if (!result && result !== 0)
			result = this.style[style.camelCase()];

		return (result === '') ? null : result;
	},

	addEvent: function(ev, func, bubble){
		if (Element.Delegate){
			var evs = ev.split(':');
			if (evs.length > 1){
				new Element.Delegate(evs[0], evs[1], this).addEvent(func);
				return this;
			}
		}
		this.addEventListener(ev, func, bubble || false);
		return this;
	},

	removeEvent: function(ev, func, bubble){
		if (Element.Delegate){
			var evs = ev.split(':');
			if (evs.length > 1){
				new Element.Delegate(evs[0], evs[1], this).removeEvent(func);
				return this;
			}
		}
		this.removeEventListener(ev, func, bubble || false);
		return this;
	},

	// Stolen from MooTools
	inject: function(el, where){
		var parent = el.parentNode,
			sibling = el.nextSibling,
			child = el.firstChild;

		switch(where) {

			case 'before':
				if (parent)
					parent.insertBefore(this, el);
			break;

			case 'after':
				if (parent)
					parent.insertBefore(this, sibling);
			break;

			case 'top':
				el.insertBefore(this, child);
			break;

			default:
				el.appendChild(this);
			break;
		}

		return this;
	},

	addClass: function(newClass){
		var classes = (this.className === '') ? [] : this.className.split(' '),
			index = classes.indexOf(newClass);
		// No need to add the class if it has already been added
		if (index >= 0)
			return this;
		classes.push(newClass);
		this.className = classes.join(' ');
		return this;
	},

	removeClass: function(removeClass){
		var classes = this.className.split(' '),
			index = classes.indexOf(removeClass);
		// No need to remove the class if it doesn't exist
		if (index < 0) return this;
		classes.splice(index, 1);
		if (classes.length)
			this.className = classes.join(' ');
		else
			this.removeAttribute('class');
		return this;
	},

	hasClass: function(className){
		var classes = this.className.split(' '),
			index = classes.indexOf(className);
		if (index >= 0)
			return true;
		else
			return false;
	},

	getChildren: function(){
		return new Elements(this.childNodes);
	},

	getFirst: function(){
		return this.getChildren()[0] || null;
	},

	destroy: function(){
		this.dispose();
		return null;
	},

	dispose: function(){
		return this.parentNode ? this.parentNode.removeChild(this) : this;
	},

	// Stolen from MooTools
	getSize: function(){
		return {
			x: this.offsetWidth,
			y: this.offsetHeight
		};
	},

	// Stolen from MooTools
	getScroll: function(){
		if (this === document.body)
			return window.getScroll();

		return {
			x: this.scrollLeft,
			y: this.scrollTop
		};
	},

	// Stolen from MooTools
	getScrolls: function(){
		var element = this.parentNode,
			position = {
				x: 0,
				y: 0
			};

		while (element && element !== document.body){
			position.x += element.scrollLeft;
			position.y += element.scrollTop;
			element = element.parentNode;
		}

		return position;
	},

	getOffsets: function(){
		var element = this, position = {
			x: 0,
			y: 0
		};

		if (element === document.body) return position;

		while (element && element !== document.body){
			position.x += element.offsetLeft;
			position.y += element.offsetTop;

			element = element.offsetParent;
		}

		return position;
	},


	getPosition: function(){
		var offset = this.getOffsets(),
			scroll = this.getScrolls(),
			position = {
				x: offset.x - scroll.x,
				y: offset.y - scroll.y
			};

		return position;
	},

	getParent: function(){
		return document.id(this.parentNode);
	}

};


// Adding plural methods from singulars
ElProto.setStyles = ElProto.setStyle.overloadSetter(true);
ElProto.getStyles = ElProto.getStyle.overloadGetter(true);
ElProto.addEvents = ElProto.addEvent.overloadSetter(true);
ElProto.removeEvents = ElProto.removeEvent.overloadSetter(true);

// Implement the new prototype onto Elements
if (!badProto) Atlas.implement(Element.constructor, ElProto, true);


// Create the Elements prototype from Element
Object.each(ElProto, function(val, key){
	var prefix = (key.length >= 3) ? key.substr(0, 3) : '',
		setter = function(){
			var arr = Array.from(arguments);
			arr.unshift(key);
			this.invoke.apply(this, arr);

			// Clear the array on destroy
			if (key === 'destroy') this.splice(0,this.length);

			return this;
		},
		getter = function(){
			var arr = Array.from(arguments),
				returns = [];

			this.each(function(el){
				returns.push(el[key].apply(el, arr));
			});

			return returns;
		};

	if (Atlas.typeOf(val) !== 'function') ElsProto[key] = val;
	else if (prefix === 'get' || prefix === 'has') ElsProto[key] = getter;
	else ElsProto[key] = setter;
});

// Implement the Elements prototype onto the Elements constructor
Atlas.implement(Elements, ElsProto, true);

// Extend the global namespace with Element and Elements
Atlas.extend(global, 'Element', Element);
Atlas.extend(global, 'Elements', Elements);

getCompatElement = function (element){
	var doc = element.getDocument();
	return (!doc.compatMode || doc.compatMode == 'CSS1Compat') ? doc.html : doc.body;
};

// Adding special window methods
Atlas.extend(window, {

	addEvent: function(ev, func, bubble){
		if (ev === 'domready') ev = 'DOMContentLoaded';
		this.addEventListener(ev, func, bubble || false);
		return this;
	},

	removeEvent: function(ev, func, bubble){
		if (ev === 'domready') ev = 'DOMContentLoaded';
		this.removeEventListener(ev, func, bubble || false);
		return this;
	},

	getSize: function(){
		return {
			x: document.body.clientWidth,
			y: document.body.clientHeight
		};
	},

	getScroll: function(){
		var win = this.getWindow(), doc = getCompatElement(this);
		return {x: win.pageXOffset || doc.scrollLeft, y: win.pageYOffset || doc.scrollTop};
	},

	getScrollSize: function(){
		var doc = getCompatElement(this),
			min = this.getSize(),
			body = this.getDocument().body;

		return {x: Math.max(doc.scrollWidth, body.scrollWidth, min.x), y: Math.max(doc.scrollHeight, body.scrollHeight, min.y)};
	},

	getPosition: function(){
		return {x: 0, y: 0};
	},

	getDocument: function(){
		return this.document;
	}

}, true);

}).call(this, this);
