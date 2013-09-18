// jshint strict:false, loopfunc:true
(function(global){

var Atlas, parent, Class;

Atlas = global.Atlas;
if (!Atlas) return;

/*
 *
 * Fast and simple Class implementation
 *
 * Based on http://myjs.fr/my-class/
 * API inspired by MooTools
 *
 */

// Parent method for class Extends
parent = function(){
	var args = Array.from(arguments),
		key  = args.splice(0, 1)[0],
		method, toReturn;

	if (key === 'initialize')
		method = this.__constructor__;
	else
		method = this[key];

	// Store a reference to the parent this if not set
	if (!method.__parent__)
		method.__parent__ = this;

	// Move up the proto chain to the next level of __super__
	method.__parent__ = method.__parent__.__super__ || method.__parent__.prototype.__super__;

	// Execute the __super__ method, initialize is a special case
	if (key === 'initialize')
		toReturn = method.__parent__.apply(this, args);
	else
		toReturn = method.__parent__.prototype[key].apply(this, args);

	// Remove the reference to parent, since we are done extending
	delete method.__parent__;

	// Support return values
	return toReturn;
};

Class = function(base){
	var constr = function(){},
		isFunc = false,
		SuprProto = function(){};

	base = base || {};

	if (Atlas.typeOf(base) === 'function'){
		constr = base;
		isFunc = true;
	} else if (base.initialize){
		constr = base.initialize;
		delete base.initialize;
	}

	if (!isFunc && base.Extends){
		SuprProto.prototype = base.Extends.prototype;

		constr.prototype = new SuprProto();

		constr.implement({
			__super__ : base.Extends,
			parent    : parent
		});

		delete base.Extends;
	}

	if (!isFunc && base.Implements){
		Array.from(base.Implements).each(function(kls){
			constr.implement(kls.prototype);
		}, this);

		delete base.Implements;
	}

	constr.implement(this);

	if (!isFunc)
		constr.implement(base);

	Atlas.extend(constr, 'implement', function(key, value){
		Atlas.implement(this, key, value);
	}.overloadSetter());

	Atlas.extend(constr, 'extend', function(key, value){
		Atlas.extend(this, key, value);
	}.overloadSetter());

	if (!constr.prototype.__constructor__)
		constr.implement('__constructor__', Class);

	return constr;
};

new Atlas.Type('class', Class);

Atlas.extend(global, 'Class', Class);

Atlas.extend(Class, {

	// Stolen from MooTools - called reset
	instantiate: function(object){
		var key, value, F;

		for (key in object){
			value = object[key];
			switch (Atlas.typeOf(value)){
				case 'object':
					F = function(){};
					F.prototype = value;
					object[key] = Class.instantiate(new F());
				break;
				case 'array':
					object[key] = value.clone();
				break;
			}
		}

		return object;
	},

	// Stolen from Mootools
	Options: new Class({

		setOptions: function(){
			this.options = Object.merge.apply(null, [{}, this.options].append(arguments));
			return this;
		}

	}),

	// My refactored events mix in
	Events: new Class({

		addEvent: function(event, fn){
			if (!this.__events__) this.__events__ = {};
			var list = this.__events__[event] || (this.__events__[event] = []);
			if (list.indexOf(fn) !== -1) return this;
			list.push(fn);
			return this;
		},

		removeEvent: function(event, fn){
			if (!this.__events__) this.__events__ = {};

			var list = this.__events__[event], i;
			if (!list) return this;
			if (list.indexOf(fn) === -1) return this;
			list.splice(i, 1);
			if (!list.length) delete this.__events__[event];
			return this;
		},

		fireEvent: function(event){
			var list, f, args, l;
			if (!this.__events__) this.__events__ = {};

			list = this.__events__[event];
			if (!list) return this;
			args = Array.prototype.slice.call(arguments, 1);
			for (f = 0, l = list.length; f < l; f++) list[f].apply(this, args);
			return this;
		}

	}),

	// Stolen from PowerTools, http://github.com/cpojer
	Binds: new Class({

		bound: function(name){
			if (!this.__bound__) this.__bound__ = {};
			return this.__bound__[name] ? this.__bound__[name] : this.__bound__[name] = this[name].bind(this);
		}

	})

});

// Add plurals to addEvent/removeEvent
Atlas.implement(Class.Events, {

	addEvents: Class.Events.prototype.addEvent.overloadSetter(true),

	removeEvents: Class.Events.prototype.removeEvent.overloadSetter(true)

}, true);

}).call(this, this);
