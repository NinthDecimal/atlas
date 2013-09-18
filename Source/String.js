// jshint strict:false
(function(global){

var Atlas = global.Atlas, UID;
if (!Atlas) return;

// Add type
new Atlas.Type('string', String, true);

Atlas.extend(String, {

	// Stolen from MooTools
	uniqueID: function(){
		if (!UID) UID = Date.now();
		return (UID++).toString(36);
	}

}, true);

Atlas.implement(String, {

	// Stolen from MooTools
	trim: function(){
		return String(this).replace(/^\s+|\s+$/g, '');
	},

	// Stolen from MooTools
	camelCase: function(){
		return String(this).replace(/-\D/g, function(match){
			return match.charAt(1).toUpperCase();
		});
	},

	// Stolen from MooTools
	hyphenate: function(){
		return String(this).replace(/[A-Z]/g, function(match){
			return ('-' + match.charAt(0).toLowerCase());
		});
	},

	// Stolen from MooTools
	contains: function(string, separator){
		return (separator) ? (separator + this + separator).indexOf(separator + string + separator) > -1 : String(this).indexOf(string) > -1;
	},

	// Stolen from MooTools
	substitute: function(object, regexp){
		return String(this).replace(regexp || (/\\?\{([^{}]+)\}/g), function(match, name){
			if (match.charAt(0) == '\\') return match.slice(1);
			return (object[name] != null) ? object[name] : '';
		});
	},

	escapeRegExp: function(){
		return String(this).replace(/([-.*+?^${}()|[\]\/\\])/g, '\\$1');
	},

	// Stolen from MooTools
	parseQueryString: function(decodeKeys, decodeValues){
		if (decodeKeys == null) decodeKeys = true;
		if (decodeValues == null) decodeValues = true;

		var vars = this.split(/[&;]/),
			object = {};
		if (!vars.length) return object;

		vars.each(function(val){
			var index = val.indexOf('=') + 1,
				value = index ? val.substr(index) : '',
				keys = index ? val.substr(0, index - 1).match(/([^\]\[]+|(\B)(?=\]))/g) : [val],
				obj = object;
			if (!keys) return;
			if (decodeValues) value = decodeURIComponent(value);
			keys.each(function(key, i){
				if (decodeKeys) key = decodeURIComponent(key);
				var current = obj[key];

				if (i < keys.length - 1) obj = obj[key] = current || {};
				else if (Atlas.typeOf(current) == 'array') current.push(value);
				else obj[key] = current != null ? [current, value] : value;
			});
		});

		return object;
	},

	queryStringAppend: function(str){
		str = (Atlas.typeOf(str) === 'object') ? Object.toQueryString(str) : str;
		var sep = this.indexOf('?') == -1 ? '?' : '&';
		return this + sep + str;
	}

}, true);

}).call(this, this);
