// jshint strict:false, eqnull:true, expr:true
(function(global){

var Atlas, METHODS, ENUMERABLES;

Atlas = global.Atlas;
if (!Atlas) return;

METHODS = 'constructor,toString,valueOf,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString'.split(','),
ENUMERABLES = !({ valueOf: 0 }).propertyIsEnumerable('valueOf') ? METHODS : false;

// Add type
new Atlas.Type('function', Function, true);

Atlas.implement(global.Function, {

	// Stolen from MooTools
	pass: function(args, bind){
		var self = this;
		if (args != null) args = Array.from(args);
		return function(){
			return self.apply(bind, args || arguments);
		};
	},

	// Stolen from MooTools
	delay: function(delay, bind, args){
		return setTimeout(this.pass((args == null ? [] : args), bind), delay);
	},

	// Stolen from MooTools
	periodical: function(periodical, bind, args){
		return setInterval(this.pass((args == null ? [] : args), bind), periodical);
	},

	// Function bind shim - https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
	bind: function (oThis) {
		if (typeof this !== 'function') {
			throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
		}

		var aArgs = Array.prototype.slice.call(arguments, 1),
		fToBind = this,
		FNOP = function() {},
		fBound = function() {
			return fToBind.apply(this instanceof FNOP ? this : oThis || window, aArgs.concat(Array.prototype.slice.call(arguments)));
		};

		FNOP.prototype = this.prototype;
		fBound.prototype = new FNOP();

		return fBound;
	},

	// Stolen from MooTools
	overloadGetter: function(usePlural){
		var self = this;
		return function(a){
			var args, result, i;
			if (typeof a != 'string') args = a;
			else if (arguments.length > 1) args = arguments;
			else if (usePlural) args = [a];
			if (args){
				result = {};
				for (i = 0; i < args.length; i++) result[args[i]] = self.call(this, args[i]);
			} else {
				result = self.call(this, a);
			}
			return result;
		};
	},

	// Stolen from MooTools
	overloadSetter: function(usePlural){
		var self = this;
		return function(a, b){
			var k, i;
			if (a == null) return this;
			if (usePlural || typeof a != 'string'){
				for (k in a) self.call(this, k, a[k]);
				if (ENUMERABLES) for (i = ENUMERABLES.length; i--;){
					k = ENUMERABLES[i];
					if (a.hasOwnProperty(k)) self.call(this, k, a[k]);
				}
			} else {
				self.call(this, a, b);
			}
			return this;
		};
	}

}, true);


// Ripped from Mootools
Atlas.implement(Function, {

	extend: (function(key, value){
		this[key] = value;
	}).overloadSetter(),

	implement: (function(key, value){
		this.prototype[key] = value;
	}).overloadSetter()

}, true);


}).call(this, this);
