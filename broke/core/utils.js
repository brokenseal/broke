/*
 * Extending some base objects like Array, String, Number, Date and
 * personal implementations of common Python functions,
 * HTML 5 objects and random stuff
 * 
 */

(function(){
	var gettext= broke.i18n.gettext;
	
	broke.extend(window, {
		forEach: function(obj, fn){
			var key;
			
			for(key in obj) {
				if(obj.hasOwnProperty(key)) {
					if(fn.call(obj[key], key) === false) {
						
						// if the callback returns false, stops the iteration
						// and return false
						return false;
					}
				}
			}
		},
		center: function(value, spaces){
			var spacesBefore,
				spacesAfter;
			spaces= spaces - value.length;
			
			if(!spaces) {
				return value;
			}
			spacesBefore= Math.ceil(spaces/2);
			spacesAfter= Math.floor(spaces/2);
			value= value.split();
			
			while(spacesBefore--) {
				value.unshift(' ');
			}
			while(spacesAfter--) {
				value.push(' ');
			}
			
			return value.join();
		},
		// a better getattr that actually cycle through all the attributes
		// e.g.: getattr('href', window.location) => location.href
		// e.g.: getattr('location.href') => location.href
		// e.g.: getattr('broke.template.defaultFilters') => broke.template.defaultFilters
		// e.g.: getattr('defaultFilters', broke.template) => broke.template.defaultFilters
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
				var results= [];
				
				forEach(object, function(key){
					results.push(key);
				});
				return results;
			};
		})(),
		// a better typeof
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
			} else if(obj instanceof Date) {
				return "date";
			} else if(obj === null) {
				return "null";
			} else if(obj === undefined) {
				return "undefined";
			}
			
			return "object";
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
		eq: function(first, second){
			var i,
				key;
			
			if(first === undefined || second === undefined) {
				// undefined does not equal to anything
				return false;
			} else if(first === null || second === null) {
				// null does not equal to anything
				return false;
			} else if(first == second) {
				return true;
			}
			
			if(isArray(first) && isArray(second)) {
				// arrays compare
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
			} else if(isObject(first) && isObject(second)) {
				// objects compare
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
						description: gettext("Sorry, this version of localStorage is a fake and does not support key() method.")
					};
				},
				setItem: function(key, value){
					storage[key]= value;
					return this;
				},
				getItem: function(key){
					return storage[key];
				},
				removeItem: function(key){
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
		})(),
		random: {
			random: Math.random,
			randrange: function(start, stop, step){
				// TODO
			}
		}
	});
	
	/*************************************************************************/
	/**************************** ARRAY OBJECT *******************************/
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
			var _this= this;
			
			if(typeOf(from) === "array") {
				from.each(function(){
					_this.remove(_this.indexOf(this));
				});
				
				return _this;
			} else {
				var rest = this.slice((to || from) + 1 || this.length);
				this.length = from < 0 ? this.length + from : from;
				return this.push.apply(this, rest);
			}
		},
		has: function(obj) {
			return this.indexOf(obj) >= 0;
		}
	});
	
	/*************************************************************************/
	/**************************** STRING OBJECT ******************************/
	/*************************************************************************/
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
		upper: function() {
			return this.toUpperCase();
		},
		trim: function() {
			var	str= this.replace(/^\s\s*/, ''),
				ws= /\s/,
				i= str.length;
			while(ws.test(str.charAt(--i)));
			
			return str.slice(0, i + 1);
		},
		asInt: function() {
			return parseInt(this, 10);
		},
		capitalize: function(){
			return this.replace(/\w+/g, function(a){
				return a[0].toUpperCase() + a.substr(1).toLowerCase();
			});
		},
		slugify: function() {
			return this.replace(/^\s+/gi,"")
					.replace(/\s+$/gi,"")
					.replace(/\s+/g,'-')
					.replace(/'+/g,'-')
					.toLowerCase();
		},
		rescape: function(){
			return this.replace(/(\(|\)|\{|\})/g,'\\$1');
		},
		bsplit: function(path){
			var cursor= 0,
				result= [],
				_this= this;
			
			this.replace(path, function(m1, m2, n){
				result.push(_this.slice(cursor, n));
				result.push(m1);
				cursor= n + m1.length;
			});
			
			return result;
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
					cache[this] = cache[this] || document.getElementById(this).innerHTML.interpolate()
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
						   .split("\r").join("\\'") +
						   "');" +
						"}" +
						"return p.join('');"
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
					cache[this] = cache[this] || document.getElementById(this).innerHTML.render()
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
						   .replace(/\t(.*?)\}\}/g, "',$1,'")
						   .split("\t").join("');")
						   .split("}}").join("p.push('")
						   .split("\r").join("\\'") +
						   "');" +
						"}" +
						"return p.join('');"
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
	
	/*************************************************************************/
	/**************************** NUMBER OBJECT ******************************/
	/*************************************************************************/
	broke.extend(Number.prototype, {
		asInt: function() {
			return parseInt(this, 10);
		}
	});
	
	/*************************************************************************/
	/***************************** DATE OBJECT *******************************/
	/*************************************************************************/
	broke.extend(Date.prototype, {
		format: function(format) {
			// borrowed from http://jacwright.com/projects/javascript/date_format
			var formatLength= format.length,
				i,
				curChar,
				returnStr = '',
				replace = {
					// make them translatable
					shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
					longMonths: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
					shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
					longDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
					
					// Day
					d: function() { return (this.getDate() < 10 ? '0' : '') + this.getDate(); },
					D: function() { return Date.replaceChars.shortDays[this.getDay()]; },
					j: function() { return this.getDate(); },
					l: function() { return Date.replaceChars.longDays[this.getDay()]; },
					N: function() { return this.getDay() + 1; },
					S: function() { return (this.getDate() % 10 == 1 && this.getDate() != 11 ? 'st' : (this.getDate() % 10 === 2 && this.getDate() != 12 ? 'nd' : (this.getDate() % 10 == 3 && this.getDate() !== 13 ? 'rd' : 'th'))); },
					w: function() { return this.getDay(); },
					z: function() { return "Not Yet Supported"; },
					// Week
					W: function() { return "Not Yet Supported"; },
					// Month
					F: function() { return Date.replaceChars.longMonths[this.getMonth()]; },
					m: function() { return (this.getMonth() < 9 ? '0' : '') + (this.getMonth() + 1); },
					M: function() { return Date.replaceChars.shortMonths[this.getMonth()]; },
					n: function() { return this.getMonth() + 1; },
					t: function() { return "Not Yet Supported"; },
					// Year
					L: function() { return (((this.getFullYear()%4 === 0)&&(this.getFullYear()%100 !== 0)) || (this.getFullYear()%400 === 0)) ? '1' : '0'; },
					o: function() { return "Not Supported"; },
					Y: function() { return this.getFullYear(); },
					y: function() { return ('' + this.getFullYear()).substr(2); },
					// Time
					a: function() { return this.getHours() < 12 ? 'am' : 'pm'; },
					A: function() { return this.getHours() < 12 ? 'AM' : 'PM'; },
					B: function() { return "Not Yet Supported"; },
					g: function() { return this.getHours() % 12 || 12; },
					G: function() { return this.getHours(); },
					h: function() { return ((this.getHours() % 12 || 12) < 10 ? '0' : '') + (this.getHours() % 12 || 12); },
					H: function() { return (this.getHours() < 10 ? '0' : '') + this.getHours(); },
					i: function() { return (this.getMinutes() < 10 ? '0' : '') + this.getMinutes(); },
					s: function() { return (this.getSeconds() < 10 ? '0' : '') + this.getSeconds(); },
					// Timezone
					e: function() { return "Not Yet Supported"; },
					I: function() { return "Not Supported"; },
					O: function() { return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + (Math.abs(this.getTimezoneOffset() / 60)) + '00'; },
					P: function() { return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + (Math.abs(this.getTimezoneOffset() / 60)) + ':' + (Math.abs(this.getTimezoneOffset() % 60) < 10 ? '0' : '') + (Math.abs(this.getTimezoneOffset() % 60)); },
					T: function() { var m = this.getMonth(); this.setMonth(0); var result = this.toTimeString().replace(/^.+ \(?([^\)]+)\)?$/, '$1'); this.setMonth(m); return result;},
					Z: function() { return -this.getTimezoneOffset() * 60; },
					// Full Date/Time
					c: function() { return this.format("Y-m-d") + "T" + this.format("H:i:sP"); },
					r: function() { return this.toString(); },
					U: function() { return this.getTime() / 1000; }
				};
			
			for(i= 0; i < formatLength; i++) {
				curChar= format.charAt(i);
				
				if(curChar in replace) {
					returnStr+= replace[curChar].call(this);
				} else {
					returnStr+= curChar;
				}
			}
			
			return returnStr;
		}
	});
})();
