// jshint strict:false, eqnull:true
(function(){
var Atlas, Type;

Atlas = this.Atlas = {

	version: '0.2',

	// Stolen and simplified from Mootools
	typeOf: function(item){
		if (item == null) return 'null';
		if (item.prototype && item.prototype.__type__) return item.prototype.__type__;
		if (item.__type__) return item.__type__;

		if (item.nodeName) {
			if (item.nodeType == 1) return 'element';
			if (item.nodeType == 3) return (/\S/).test(item.nodeValue) ? 'textnode' : 'whitespace';
		} else if (typeof item.length == 'number') {
			if (item.callee) return 'arguments';
			if (item.charAt) return 'string';
			if ('item' in item) return 'collection';
		}

		return typeof item;
	},

	// Stolen from MooTools
	instanceOf: function(item, object){
		if (item == null) return false;

		var constructor = item.__constructor__;
		while (constructor){
			if (constructor === object) return true;
			constructor = constructor.__super__;
		}

		// @block: ie
		if (!item.hasOwnProperty) return false;
		// @end

		return item instanceof object;
	},

	// Stolen from MooTools
	__isEnumerable__: function(item){
		return (item != null && typeof item.length == 'number' && Object.prototype.toString.call(item) != '[object Function]' );
	},

	// Adds to parent's prototype
	implement: function(parent, a, b, c){
		var type = Atlas.typeOf(a),
			safe = type === 'string' ? !!c : !!b, base;

		base = Atlas.__getObject__(type, a, b);

		return Atlas.__setProperty__(base, parent.prototype, safe);
	},

	// Adds to parent
	extend: function(parent, a, b, c){
		var type = Atlas.typeOf(a),
			safe = type === 'string' ? !!c : !!b, base;

		base = Atlas.__getObject__(type, a, b);

		return Atlas.__setProperty__(base, parent, safe);
	},

	__getObject__: function(type, a, b){
		var base = {};

		if (type === 'string') base[a] = b;
		else base = a;

		return base;
	},

	__setProperty__: function(base, parent, safe){
		var implemented = true, key;

		for (key in base){
			if (safe && parent[key]){
				implemented = false;
				continue;
			}

			parent[key] = base[key];
		}

		return implemented;
	},

	// Generic Atlas clone wrapper
	__clone__: function(item){
		var type = Atlas.typeOf(item),
			Base = Atlas.Types[type] || {};

		if (Base && Base.clone) return Base.clone(item);
		return item;
	},

	// Generic Atlas merge wrapper
	__merge__: function(source, key, current){
		switch (Atlas.typeOf(current)){
			case 'object':
				if (Atlas.typeOf(source[key]) === 'object')
					Object.merge(source[key], current);
				else
					source[key] = Object.clone(current);
			break;

			case 'array':
				source[key] = Array.clone(current);
			break;

			default:
				source[key] = current;
		}
		return source;
	}

};

Type = Atlas.Type = function(name, object, isNative){
	if (Atlas.Types[name]) return Atlas.Types[name];

	if (!isNative && object !== Object){
		object.extend(this);
		Atlas.extend(object, 'constructor', Atlas.Type);
	}

	if (object !== Object){
		Atlas.extend(object, '__type__', 'type');
		Atlas.implement(object, '__type__', name);
		Atlas.implement(object, 'constructor', object);
	}

	Atlas.Types[name] = object;
	return object;
};

Atlas.extend(Type, '__type__', 'type');

Atlas.Types = {};

}).call(this);
