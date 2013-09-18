// jshint strict:false
(function(global){

var Atlas, DELEGATES, getDelegate, Delegate;

Atlas = global.Atlas;
if (!Atlas || !document) return;

// Used to store all delegates in use
DELEGATES = [];

// Find delegate if it exists based on the key (eg: event:tags,.classes,data-attributes)
// and parentEl element
getDelegate = function(key, parentEl){
	var valid = null;

	DELEGATES.each(function(instance){
		if (instance.key === key && instance.parentEl === parentEl)
			valid = instance;
	});

	return valid;
};

// Because my Class implementation is so lightweight,
// I am using that instead of base functions
Delegate = new Class({

	// By using Class.Events, we get a lot of free functionality
	Extends: Class.Events,

	// Specified tags are stored here
	tags       : [],
	// Specified CSS classes are stored here.
	// Must be prefixed with  a '.'
	classes    : [],
	// Specified data attributes are stored here.
	// Must be prefixed with 'data-'
	attributes : [],
	// Cleaned up string of all stored tags, classes and attributes
	type       : null,

	// Constructor
	initialize: function(event, types, parentEl){
		this.event = event;
		// Clean types
		this.types = types.split(',').each(Delegate.cleanType, this);
		this.parentEl = document.id(parentEl);

		// Special ID used in conjunction with the parentEl element
		// to store a reference to this class internally
		this.key = this.event + ':' + this.types.join(',');

		// Find the stored delegate, if it exists
		var delegate = getDelegate(this.key, this.parentEl);
		if (delegate) return delegate;

		// Ensures that we don't embed our items in the class prototype
		this.tags = [];
		this.classes = [];
		this.attributes = [];

		// Parse all the types out, and add them to the appropriate arrays
		this.types.each(Delegate.parseType, this);

		// Prebind fireEvent for easy adding and removing
		this.fireEvent = this.fireEvent.bind(this);

		// Add pre-bound fireEvent to parentEl element
		this.parentEl.addEvent(this.event, this.fireEvent);

		// Add instance to internal delegates store
		DELEGATES.push(this);
	},

	addEvent: function(func){
		this.parent('addEvent', this.event, func);
		if (DELEGATES.indexOf(this) < 0) DELEGATES.push(this);
		return this;
	},

	removeEvent: function(func){
		this.parent('removeEvent', this.event, func);
		// Garbage collect the delegate instance if removing the final event
		// and remove the parentEl event
		if (!this.__events__[this.event]){
			DELEGATES.splice(DELEGATES.indexOf(this), 1);
			this.parentEl.removeEvent(this.event, this.fireEvent);
		}
		return this;
	},

	fireEvent: function(){
		var args = Array.from(arguments),
			element = null,
			toCheck = args[0].target || args[0].srcElement, // Support for standard browsers and IE
			tagIndex, classIndex, attributeIndex;

		// Test for delegation here
		while(!element && toCheck){
			if (toCheck === this.parentEl) break; // Quick escape if parentEl clicked

			// Test toCheck against tags, classes and attributes
			tagIndex = Delegate.checkTag(toCheck, this.tags);
			classIndex = Delegate.checkClasses(toCheck, this.classes);
			attributeIndex = Delegate.checkAttributes(toCheck, this.attributes);

			if (tagIndex || classIndex || attributeIndex){
				element = toCheck;
				break;
			}

			// toCheck did not contain a tag, class or attribute match,
			// cycle up to the parentNode
			toCheck = (toCheck.parentNode) ? toCheck.parentNode : null;
		}

		// No element match, escape out
		if (!element) return;

		// Add event as the first argument, for fireevent
		args.unshift('fireEvent', this.event);
		// Add the element as a secondary argument for fired events
		args.push(element);
		// Call Class.Events.fireEvent
		this.parent.apply(this, args);
	}

});


Atlas.extend(Delegate, {

	checkTag: function(element, tags){
		var index = tags.indexOf(element.tagName.toLowerCase()) + 1;
		return !!index;
	},

	checkClasses: function(element, classes){
		var hasClass = false;
		classes.each(function(cls){
			if (element.hasClass(cls)) hasClass = true;
		});
		return hasClass;
	},

	checkAttributes: function(element, attributes){
		var hasAttr = false;
		attributes.each(function(attr){
			if (element.hasAttribute(attr)) hasAttr = true;
		});
		return hasAttr;
	},

	cleanType: function(str, i, arr){
		str = str.trim();
		str = str.toLowerCase();
		if (str === '') return;
		arr[i] = str.trim();
	},

	parseType: function(type){
		var dataPrefix = (type.length > 5) ? type.substr(0, 5) : null;

		if (dataPrefix === 'data-')
			return this.attributes.push(type);
		if (type.charAt(0) === '.')
			return this.classes.push(type.substr(1));
		this.tags.push(type);
	}

});

Atlas.extend(global.Element, 'Delegate', Delegate, true);

}).call(this, this);
