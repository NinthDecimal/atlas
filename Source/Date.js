// jshint strict:false
// @block: ie
(function(global){

var Atlas = global.Atlas;
if (!Atlas) return;

Atlas.extend(Date, {

	// Date.now shim, from MDN
	now: function now(){
		return +(new Date());
	}

}, true);

}).call(this, this);
// @end
