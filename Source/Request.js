// jshint strict:false
// @block: req
(function(global){

var Request, errors;

Request = new Class({

	Implements: [Class.Options, Class.Events],

	options: {
		method: 'POST',
		url: global.location.href,
		async: true,
		headers: {
			'Accept': 'text/plain,text/html,application/xhtml+xml,application/xml',
			'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
			'X-Requested-With': 'XMLHttpRequest'
		}
	},

	initialize: function(options){
		this.xhr = new XMLHttpRequest();
		this.xhr.onreadystatechange = this.readyStateChange.bind(this);
		this.setOptions(options);
		return this;
	},

	post: function(){
		this.options.method = 'post';
		this.send.apply(this, arguments);
	},

	get: function(){
		this.options.method = 'get';
		this.send.apply(this, arguments);
	},

	send: function(data){
		var method = this.options.method.toUpperCase(),
			url = this.options.url,
			query = Object.toQueryString(data),
			isGet = (method === 'GET') ? true : false,
			hasQuery = url.contains('?'),
			headers, header;

		if (isGet && hasQuery)
			url += '&' + query;
		else if (isGet)
			url += '?' + query;

		this.xhr.open(method, url, this.options.async);

		// Set Headers
		headers = this.options.headers;
		for (header in headers) {
			this.xhr.setRequestHeader(header, headers[header]);
		}

		if (isGet)
			this.xhr.send(null);
		else
			this.xhr.send(query);
	},

	readyStateChange: function(){
		if (this.xhr.readyState !== 4) return;
		if ((this.xhr.status >= 200 && this.xhr.status < 300) || this.xhr.status === 0) this.success();
		else this.failure();
		this.fireEvent('complete', this.xhr.responseText);
	},

	success: function(){
		this.fireEvent('success', this.xhr.responseText);
	},

	failure: function(){
		this.fireEvent('failure', this.xhr.responseText);
	}

});

Request.JSON = new Class({

	Extends: Request,

	options: {
		method: 'POST',
		url: global.location.href,
		async: true,
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
			'X-Requested-With': 'XMLHttpRequest'
		}
	},

	initialize: function(options){
		this.parent('initialize', options);
	},

	send: function(data){
		this.jsonResponse = null;
		return this.parent('send', data);
	},

	readyStateChange: function(){
		if (this.xhr.readyState !== 4) return;
		try {
			this.jsonResponse = JSON.parse(this.xhr.responseText);
		}
		catch (e){}
		if ((this.xhr.status >= 200 && this.xhr.status < 300) || this.xhr.status === 0) this.success();
		else this.failure();
		this.fireEvent('complete', this.jsonResponse);
	},

	success: function(){
		// Validate as an error if undefined JSON response
		if (this.jsonResponse === undefined) {
			this.jsonResponse = errors('success');
			return this.fireEvent('failure', this.jsonResponse);
		}
		this.fireEvent('success', this.jsonResponse);
	},

	failure: function(){
		if (this.jsonResponse === undefined)
			this.jsonResponse = errors();
		this.fireEvent('failure', this.jsonResponse);
	}
});

errors = function(success){
	return {
		error: true,
		message: success ? 'No data received' : 'Unable to complete the request'
	};
};

global.Atlas.extend(global, 'Request', Request, true);

}).call(this, this);
// @end
