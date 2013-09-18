// jshint strict:false
(function(global){

var Atlas = global.Atlas;
if (!Atlas) return;

// Add type
new Atlas.Type('number', Number);

Atlas.extend(Number, {

    // Stolen from MooTools
	random: function(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

}, true);


Atlas.implement(Number, {

    // Stolen from MooTools
	limit: function(min, max){
		return Math.min(max, Math.max(min, this));
	},

    // Stolen from MooTools
	round: function(precision){
		precision = Math.pow(10, precision || 0).toFixed(precision < 0 ? -precision : 0);
		return Math.round(this * precision) / precision;
	},

    // Stolen from MooTools
	times: function(fn, bind){
		for (var i = 0; i < this; i++) fn.call(bind, i, this);
	}

}, true);

}).call(this, this);
