/*
 * Broke project - a broken project brought to you by Davide Callegari - http://www.brokenseal.it/
 * 
 * Inspired by the Django Web Framework - http://www.djangoproject.com/
 * A lot of inspirement/copy from other Javascript Libraries like:
 *  - jQuery - http://jquery.com/
 *  - JavascriptMVC - http://javascriptmvc.com/
 * 
 * Licensed under MIT.
 * 
 */

var broke= {},
	bk= broke;

(function(){
	broke.extend = function() {
		// copy reference to target object
		var target = arguments[0] || {}, i = 1, length = arguments.length, deep = false, options;
		// Handle a deep copy situation
		if ( typeof target === "boolean" ) {
			deep = target;
			target = arguments[1] || {};
			// skip the boolean and the target
			i = 2;
		}
		// Handle case when target is a string or something (possible in deep copy)
		if ( typeof target !== "object" && !(target instanceof Function)) {
			target = {};
		}
		// extend broke itself if only one argument is passed
		if ( length == i ) {
			target = this;
			--i;
		}
		for ( ; i < length; i++ ) {
			// Only deal with non-null/undefined values
			if ( (options = arguments[ i ]) !== null ) {
				// Extend the base object
				for ( var name in options ) {
					var src = target[ name ], copy = options[ name ];
					// Prevent never-ending loop
					if ( target === copy ) {
						continue;
					}
					// Recurse if we're merging object values
					if ( deep && copy && typeof copy === "object" && !copy.nodeType ) {
						target[ name ] = broke.extend( deep, src || ( copy.length !== null ? [ ] : { } ), copy );
					}
					// Don't bring in undefined values
					else if ( copy !== undefined ) {
						target[ name ] = copy;
					}
				}
			}
		}
		// Return the modified object
		return target;
	};
	
	broke.extend({
		/**************************** VERSION ********************************/
		VERSION: "0.1b",
		/*************************** EXCEPTIONS ******************************/
		exceptions: {
			NotFound: function(message){
				return {
					name: "NotFound",
					message: message
				};
			},
			NotImplemented: function(message){
				return {
					name: "NotImplemented",
					message: message
				};
			},
			MultipleObjectsReturned: function(message){
				return {
					name: "MultipleObjectsReturned",
					message: message
				};
			},
			DoesNotExist: function(message){
				return {
					name: "DoesNotExist",
					message: message
				};
			}
		},
		isFunction: function(obj) {
			return typeOf(obj) === "function";
		},
		isObject: function(obj) {
			return typeOf(obj) === "object";
		},
		isArray: function(obj) {
			return typeOf(obj) === "array";
		},
		clone: function(obj){
			var newObject = {};
			for (var i in obj) {
				if(obj.hasOwnProperty(i)) {
					newObject[i]= obj[i];
				}
			}
			return newObject;
		},
		removeHash: function(){
			window.location.hash= '';
			return true;
		},
		log: function(debugString, doNotAppendDate){
			if(broke.settings.debug && window.console) {
				if(!doNotAppendDate) {
					var now= new Date();
					now= now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds() + ':' + now.getMilliseconds();
					debugString= '[' + now + '] ' + debugString;
				}
				
				console.debug(debugString);
			}
		},
		fetchData: function(args){
			var data= {},
				model= args.model,
				url= args.url || broke.settings.jsonUrls.getData.render({
					appLabel: model.appLabel,
					model: model.className.lower()
				}),
				filter= args.filter || {},
				result;
			
			$.ajax({
				async: false,
				type: "GET",
				url: url,
				data: filter,
				dataType: broke.settings.ajax.dataType,
				error: function(xhr, status, error){
					result= error;
				},
				success: function(data, status){
					//broke.storage[model.tableName]= JSON.parse(data);
					broke.storage[model.tableName]= data;
					
					result= broke.storage[model.tableName];
				}
			});
			
			return result;
		},
		initStorage: function(model){
			broke.fetchData({
				'model': model
			});
		},
		initProject: function(project){
			// WARNING: for internal use only!
			
			// init project's models
			for(key in project.models){
				if(project.models.hasOwnProperty(key)) {
					broke.initStorage(project.models[key]);
				}
			}
			
			// init project's url patterns
			broke.extend(broke.urlPatterns, project.urlPatterns);
			
			// init apps' models
			for(key in project.apps){
				
				if(project.apps.hasOwnProperty(key)) {
					
					for(subKey in project.apps[key].models) {
						
						if(project.apps[key].models.hasOwnProperty(subKey)) {
							broke.initStorage(project.apps[key].models[subKey]);
						}
					}
				}
			}
			
			return project;
		},
		registerProject: function(project){
			var key,
				subKey;
			
			// settings
			broke.extend(broke.settings, project.settings);
			
			// add the project to the broke project list for later manipulation
			this.projects.push(project);
			
			//broke.initProject(project);
			
			return project;
		},
		/***************************** INIT **********************************/
		projects: [],
		storage: {},						// local database (?)
		db: {
			models: {}
		},
		i18n: {},
		locale: {},							// locale based strings
		urlPatterns: [],					// url patterns
		views: {},							// views
		templates: {},						// templates
		middleware: {},						// middleware
		contextProcessors: {}				// contextProcessors
	});
})();

/*************************************************************************/
/****************** ARRAY, STRING, NUMBER EXTENSIONS *********************/
/*************************************************************************/
broke.extend(Array.prototype, {
	clone: function() {
		var newArray = [];
		for (var i in this) {
			if(this.hasOwnProperty(i)) {
				newArray[i]= this[i];
			}
		}
		return newArray;
	},
	populate: function(args) {
		for(var i= 0; i < args.length; i++) {
			this.push(args[i]);
		}
		return this;
	},
	each: function(callback, args) {
		for(var i= 0; i< this.length; i++) {
			callback.call(this[i], args);
		}
		return this;
	},
	filter: function(callback, args) {
		var array_tmp= this.constructor();
		for(var i= 0; i< this.length; i++) {
			if(callback.call(this[i], args)) {
				array_tmp.push(this[i]);
			}
		}
		return array_tmp;
	},
	map: function(operation, args) {
		for (var i = 0; i < this.length; i++) {
			this[i]= operation.call(this[i], args);
		}
		return this;
	},
	last: function(args) {
		if(args){
			this[this.length - 1]= args;
			return this;
		}
		return this[this.length - 1];
	},
	echo: function(str){
		var tmp= str.split('%s');
		for(var i= 0; i< (tmp.length -1); i++) {
			tmp[i] += this.shift();
		}
		return tmp.join('');
	},
	indexOf: function(obj) {
		for (var i = 0; i < this.length; i++) {
			if (this[i] === obj) {
				return i;
			}
		}
		return -1;
	},
	remove: function(from, to) {
		var rest = this.slice((to || from) + 1 || this.length);
		this.length = from < 0 ? this.length + from : from;
		return this.push.apply(this, rest);
	},
	has: function(obj) {
		return this.indexOf(obj) >= 0;
	}
});

broke.extend(String.prototype, {
	'in': function(array) {
		var i;
		
		for (i= 0; i< array.length; i++) {
			if(this.concat() === array[i]) {
				return true;
			}
		}
		return false;
	},
	startsWith: function(stringToMatch){
		return this.concat().match("^" + stringToMatch) === null ? false : true ;
	},
	lower: function() {
		return this.toLowerCase();
	},
	trim: function() {
		return this.replace(/^\s+|\t|\n|\s+$/g, '');
	},
	asInt: function() {
		return parseInt(this, 10);
	},
	slugify: function() {
		return this.replace(/^\s+/gi,"")
				.replace(/\s+$/gi,"")
				.replace(/\s+/g,'-')
				.replace(/'+/g,'-')
				.toLowerCase();
	},
	interpolate: (function(){
			// A modified version of
			// Simple JavaScript Templating
			// John Resig - http://ejohn.org/ - MIT Licensed
			var cache = {};
			
			return function (data){
				// Figure out if we're getting a template, or if we need to
				// load the template - and be sure to cache the result.
				var fn = !/\W/.test(this) ?
					cache[this] = cache[this] || tmpl(document.getElementById(this).innerHTML)
					:
					// Generate a reusable function that will serve as a template
					// generator (and which will be cached).
					new Function("obj",
						"var p=[],print=function(){p.push.apply(p,arguments);};" +
						// Introduce the data as local variables using with(){}
						"with(obj){p.push('" +
						// Convert the template into pure JavaScript
						this
						   .replace(/[\r\t\n]/g, " ")
						   .split("\r").join("\\'")
						   .split("%(").join("\t")
						   .replace(/\t(.*?)\)s/g, "',$1,'")
						   .split("\t").join("');")
						   .split(")s").join("p.push('")
						   .split("\r").join("\\'")
						   + "');"
						+"}"
						+ "return p.join('');"
					);
				
				// Provide some basic currying to the user
				return data ? fn( data ) : fn;
			};
		})(),
	render: (function(){
		// A modified version of
		// Simple JavaScript Templating
		// John Resig - http://ejohn.org/ - MIT Licensed
		var cache = {};
		
		return function (data){
			// Figure out if we're getting a template, or if we need to
			// load the template - and be sure to cache the result.
			var fn = !/\W/.test(this) ?
				cache[this] = cache[this] || tmpl(document.getElementById(this).innerHTML)
				:
				// Generate a reusable function that will serve as a template
				// generator (and which will be cached).
				new Function("obj",
					"var p=[],print=function(){p.push.apply(p,arguments);};" +
					// Introduce the data as local variables using with(){}
					"with(obj){p.push('" +
					// Convert the template into pure JavaScript
					this
					   .replace(/[\r\t\n]/g, " ")
					   .split("{%").join("\t")
					   .split("\t").join("');")
					   .split("%}").join("p.push('")
					   .split("\r").join("\\'")
					   .split("{{").join("\t")
					   .replace(/\t(.*?)}}/g, "',$1,'")
					   .split("\t").join("');")
					   .split("}}").join("p.push('")
					   .split("\r").join("\\'")
					   + "');"
					+"}"
					+ "return p.join('');"
				);
			
			// Provide some basic currying to the user
			return data ? fn( data ) : fn;
		};
	})(),
	echo: function(){
		return [].populate(arguments).echo(this);
	},
	contains: function(str){
		return this.indexOf(str) >= 0;
	}
});

broke.extend(Number.prototype, {
	asInt: function() {
		return parseInt(this, 10);
	}
});



/*
 * Personal implementations of common Python functions
 * and HTML 5 objects
 * 
 */

broke.extend(window, {
	getattr: function(str, obj){
		obj= obj || window;
		str= str.split('.');
		
		if(str.length > 1) {
			str.each(function(){
				obj= obj[this.concat()];
			});
			
			return obj;
		}
		
		return obj[str[0]];
	},
	keys: (function(){
		if('keys' in window) {
			return keys;
		}
		
		return function(object) {
			var results = [],
				key;
			
			for(key in object) {
				results.push(key);
			}
			return results;
		}
	})(),
	typeOf: function(obj){
		if(typeof obj === "string") {
			return "string";
		} else if(typeof obj === "number" && isNaN(obj)) {
			return "NaN";
		} else if(typeof obj === "number") {
			return "number";
		} else if(obj instanceof Array) {
			return "array";
		} else if(obj instanceof Function) {
			return "function";
		} else if(obj === null) {
			return "null";
		} else if(obj === undefined) {
			return "undefined";
		}
		
		return "object";
	},
	eq: function(first, second){
		if(first === undefined || second === undefined) {
			// undefined does not equal to anything
			return false;
		} else if(first === null || second === null) {
			// null does not equal to anything
			return false;
		} else if(first == second) {
			return true;
		}
		
		if(broke.isArray(first) && broke.isArray(second)) {
			// arrays compare
			var i;
			
			// same length check
			if(first.length !== second.length) {
				return false;
			}
			
			// same arguments check
			i= first.length;
			
			while(i--) {
				if(first[i] !== second[i]) {
					return false;
				}
			}
			
			// all the checks have been passed, the arrays are equal
			return true;
		} else if(broke.isObject(first) && broke.isObject(second)) {
			// objects compare
			var key, subkey;
			
			// same keys compare
			if(!this.eq(keys(first), keys(second))) {
				return false;
			}
			
			// same arguments check
			for(key in first) {
				if(first.hasOwnProperty(key)) {
					if(!this.eq(first[key], second[key])) {
						return false;
					}
				}
			}
			
			// all the checks have been passed, the objects are equal
			return true;
		}
		
		return false;
	},
	clone: function(obj){
		var key,
			newObj = {};
		
		for(key in obj) {
			if(typeOf(obj[key]) === "array") {
				newObj[key] = obj[key].clone();
			} else if(typeOf(obj[key]) === "object") {
				newObj[key] = clone(obj[key]);
			}
			
			newObj[key] = obj[key];
		}
		return newObj;
	},
	storage: (function(){
		// mime or reference HTML 5's Local Storage
		var localStorageSetObject= function(key, value) {
				this.setItem(key, JSON.stringify(value));
			},
			localStorageGetObject= function(key) {
				return JSON.parse(this.getItem(key));
			},
			storage= {};
		
		if('localStorage' in window) {
			broke.extend(Storage.prototype, {
				setObject: localStorageSetObject,
				getObject: localStorageGetObject
			});
			
			return localStorage;
		}
		
		return {
			key: function(key){
				throw {
					name: "NotImplemented",
					description: "Sorry, this version of localStorage is a fake and does not support\
									key() method."
				}
			},
			setItem: function(key, value){
				storage[key]= value;
				return this;
			},
			getItem: function(key){
				return storage[key];
			},
			removeItem: function(){
				delete storage[key];
				return this;
			},
			setObject: localStorageSetObject,
			getObject: localStorageGetObject,
			clear: function(){
				storage= {};
				return this;
			}
		};
	})()
});
