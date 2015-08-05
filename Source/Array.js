// jshint eqnull:true, strict:false
(function(global){
var Atlas, fixNodelist, each;

Atlas = global.Atlas;
if (!Atlas) return;

// Add type
new Atlas.Type('array', Array, true);

Atlas.extend(Array, {

	// Clone an array
	clone: function(arr, shallow){
		var newArr = [];

		arr.forEach(function(value, i){
			if (!shallow) value = Atlas.__clone__(value);
			newArr[i] = value;
		});

		return newArr;
	},

	// Flatten all args
	flatten: function(){
		return Array.prototype.concat.apply([], Array.from(arguments)).flatten();
	}

}, true);

// We must overwrite a browsers inbuilt Array.from
Atlas.extend(Array, {
	// Stolen from Mootools
	from: function(item){
		return (Atlas.__isEnumerable__(item) && typeof item != 'string') ? (Atlas.typeOf(item) === 'array') ? item : Array.prototype.slice.call(item) : [item];
	},
});

fixNodelist = function(nodelist){
	var ret = [], x;
	for (x = 0; x < nodelist.length; x++)
	ret[x] = nodelist[x];

	return ret;
};

each = Array.prototype.forEach;

// @block: ie
// Provide forEach shim - stolen from https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/forEach
if (!each) {
	each = function(callback, thisArg) {
		var T, k, O, len, kValue;

		if (this == null)
			throw new TypeError('this is null or not defined');

		O = Object(this);

		len = O.length >>> 0;

		if (Atlas.typeOf(callback) !== 'function')
			throw new TypeError(callback + ' is not a function');

		if (thisArg) T = thisArg;

		k = 0;

		while (k < len) {
			if (k in O) {
				kValue = O[k];
				callback.call(T, kValue, k, O);
			}

			k++;
		}
	};
}
// @end

Atlas.implement(Array, {

	// @block: ie
	forEach: each,
	// @end

	each: function(){
		each.apply(this, Array.from(arguments));
		return this;
	},

	// @block: ie
	// Array indexOf shim - https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf
	indexOf: function (searchElement) {
		var t, len, n, k;
		if (this == null) throw new TypeError();

		t = Object(this);
		len = t.length >>> 0;
		if (len === 0) return -1;

		n = 0;
		if (arguments.length > 0) {
			n = Number(arguments[1]);
			if (n != n) n = 0;
			else if (n !== 0 && n != Infinity && n != -Infinity)
				n = (n > 0 || -1) * Math.floor(Math.abs(n));
		}
		if (n >= len) return -1;

		k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
		for (; k < len; k++) {
			if (k in t && t[k] === searchElement)
				return k;
		}

		return -1;
	},
	// @end

	clone: function(shallow){
		return Array.clone(this, shallow);
	},

	append: function(array){
		this.push.apply(this, array);
		return this;
	},

	// Stolen from MooTools
	flatten: function(){
		var array = [], type, i, l;
		for (i = 0, l = this.length; i < l; i++){
			type = Atlas.typeOf(this[i]);

			if (type == 'null') continue;

			array = array.concat(
				(type == 'array' || type == 'collection' || type == 'arguments' || Atlas.instanceOf(this[i], Array)) ? Array.from(this[i]).flatten() : this[i]);
		}

		return array;
	},

	// Stolen from MooTools
	invoke: function(methodName){
		var args = Array.prototype.slice.call(arguments, 1);
		return this.each(function(item){
			item[methodName].apply(item, args);
		});
	},

	getLast: function(){
		return this[this.length - 1];
	}

}, true);


}).call(this, this);
