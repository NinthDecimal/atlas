// jshint strict:false, eqnull:true
(function(global){

var Atlas, METHODS, ENUMERABLES;

Atlas = global.Atlas;
if (!Atlas) return;

// Adding type
new Atlas.Type('object', Object, true);

// Basic utilities
// Stolen and modified from MooTools Prime
METHODS = 'constructor,toString,valueOf,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString'.split(',');
ENUMERABLES = !({ valueOf: 0 }).propertyIsEnumerable('valueOf') ? METHODS : false;

Atlas.extend(Object, {

	// Iterate through an object, stolen from Mootools
	each: function(object, method, context){
		var i = (ENUMERABLES) ? ENUMERABLES.length : 0,
			key, value;

		for (key in object)
			method.call(context, object[key], key, object);

		while (i--){
			key = ENUMERABLES[i];
			value = object[key];
			if (value === Object.prototype[key]) break;
			method.call(context, value, key, object);
		}

		return object;
	},

	clone: function(obj, shallow){
		var newObj = {};

		Object.each(obj, function(value, key){
			if (!shallow) value = Atlas.__clone__(value);
			newObj[key] = value;
		});

		return newObj;
	},

	// Merge Object - stolen from MooTools
	merge: function(source, k, v){
		var i, object, key, l;
		if (Atlas.typeOf(k) === 'string')
			return Atlas.__merge__(source, k, v);

		for (i = 1, l = arguments.length; i < l; i++){
			object = arguments[i];
			for (key in object) Atlas.__merge__(source, key, object[key]);
		}

		return source;
	},

	// Append Object - Stolen from MooTools
	append: function(original){
		var i, extended, key, l;
		for (i = 1, l = arguments.length; i < l; i++){
			extended = arguments[i] || {};
			for (key in extended)
				original[key] = extended[key];
		}

		return original;
	},

	toQueryString: function(obj){
		var queryString = [], value, result, key;

		for (key in obj) {
			value = obj[key];
			result = key + '=' + encodeURIComponent(value);
			if (value != null) queryString.push(result);
		}

		return queryString.join('&');
	}

}, true);

}).call(this, this);
