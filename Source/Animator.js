// @block: anim
(function(global){

var Animator = new Class({

	Implements: [Class.Options, Class.Events],

	options: {
		duration: 500,
		tween: 'easeOutSine'
	},

	values: {
		from    : [],
		to      : [],
		current : []
	},

	running   : false,
	startTime : 0,
	tween     : null,
	duration  : 0,

	initialize: function(callback, options){
		this.callback = callback;

		this.setOptions(options);

		this._iterate = this._iterate.bind(this);
	},

	start: function(to, from, duration){
		// Currently you can only start an animation if one is not currently running
		if (this.running) return this;

		// Set starting variables
		this.running     = true;

		this.values.from = (from !== undefined) ? Array.from(from) : Array.clone(this.values.current || this.values.from);
		this.values.to   = (to   !== undefined) ? Array.from(to)   : this.values.to;

		// Always clone so we don't modify the from array
		this.values.current	= Array.clone(this.values.from);

		this.duration  = (duration !== undefined) ? duration : this.options.duration;
		this.tween     = Animator.Tweens[this.options.tween] || Animator.Tweens.linear;
		this.startTime = 0;

		// Add animation iterate to be managed by internal timer
		Animator.addInstance(this._iterate);
		return this;
	},

	// Used to stop an existing animation, fails silently
	cancel: function(toValues){
		if (!this.running) return this;
		this._halt(toValues);
		this.fireEvent('cancel', this);
		return this;
	},

	// Internal iteration handler
	_iterate: function(now){
		var time = now - this.startTime,
			duration = this.duration,
			change, from;

		// First frame of animation
		if (!this.startTime) {
			this.startTime = now;
			this.values.current = Array.clone(this.values.from);
			return this.callback(this.values.from);
		}

		// End of animation
		if (time >= this.duration){
			this.startTime = null;
			this._halt(this.values.to);
			return this.fireEvent('complete', this);
		}

		// Run current values through easing method
		this.values.current = [];
		for (var v = 0, l = this.values.from.length; v < l; v++){
			from   = this.values.from[v];
			change = this.values.to[v] - from;
			this.values.current[v] = this.tween(time, from, change, duration);
		}

		this.callback(this.values.current);
	},

	// Halt the animation
	_halt: function(toValues){
		Animator.removeInstance(this._iterate);
		this.values.current = (toValues !== undefined) ? Array.from(toValues) : this.values.current;
		this.callback(this.values.current);
		this.running = false;
	}

});

Animator.extend({

	// Add animator instance to animate
	addInstance: function(iterateFunc){
		I.instances.push(iterateFunc);
		I.startTimer();
	},

	// Queue the removal of an instance - actual removal occurs after next frame is processed
	removeInstance: function(iterateFunc){
		I.toRemove.push(iterateFunc);
	},

	// Sets the framerate and also restarts the timer if it's running to use the new FPS
	setFramerate: function(fps){
		I.fps = fps;
		I.startTimer();
	},

	// Various tweens supported
	Tweens: {

		linear: function(t, b, c, d){
			return c * t / d + b;
		},

		easeInQuad: function(t, b, c, d) {
			return c * (t /= d) * t + b;
		},

		easeOutQuad: function(t, b, c, d) {
			return -c * (t /= d) * (t - 2) + b;
		},

		easeOutSine: function (t, b, c, d) {
			return c * Math.sin(t/d * (Math.PI/2)) + b;
		},

		easeInOutSine: function (t, b, c, d) {
			return c/2 * (1 - Math.cos(Math.PI*t/d)) + b;
		}

	}
});

// Internal timer and supporting methods
var I = {

	// Status of whether the internal timer is animating or not
	running   : false,
	// All animator instances currently animating
	instances : [],
	// Animator removal queue
	toRemove  : [],
	// Current animator FPS
	fps		  : 60,
	// Reference to timer instance
	timer	  : null,

	// Starts internal timer, called by addInstance
	startTimer: function(){
		// Dissallow start to execute if a timer is running or if there are no instances
		if (!I.instances.length) return I.stopTimer();
		if (I.running) return;

		// Good practice to ALWAYS stop timer before starting it since you can end up with ghost timers
		I.stopTimer();
		I.running = true;
		I.timer = setInterval(I.iterate, 1000 / I.fps);
	},

	// Stops the timer and clears the timer instance
	stopTimer: function(){
		clearInterval(this.timer);
		this.timer = null;
		I.running = false;
	},

	// Animation frame handler, called every frame, executes all added instances
	iterate: function(){
		// Stop the timer if all instances have been removed
		if (!I.instances.length) return I.stopTimer();

		// Get time in milliseconds and execute all animator instances
		var now = Date.now();
		for (var i = 0, len = I.instances.length; i < len; i++)
			I.instances[i](now);

		// We handle removals after the frame has finished firing
		while (I.toRemove.length)
			I.removeInstance(I.toRemove.splice(0,1)[0]);
	},

	// Remove an instance
	removeInstance: function(iterateFunc){
		var index = I.instances.indexOf(iterateFunc);
		if (index < 0) return;
		I.instances.splice(index, 1);
	}

};

global.Atlas.extend(global, 'Animator', Animator, true);

}).call(this, this);
// @end
