/*
 * Personal implementations of built-in Python functions
 * and some other utilities made for Javascript itself
 */

(function(__global__){
	var
		// pythonic stuff
		getCallable= function(pathToProperty){
			// depends on require
			var
				tmpPath= pathToProperty.split('.')
				,path= tmpPath.slice(0, tmpPath.length-1).join('/')
				,property= tmpPath.slice(-1)[0]
			;
			
			return require(path)[property];
		}
		,all= function(arr){
			var arrLen= arr.length;
			while(arrLen--) {
				if(!arr[arrLen]) {
					return false;
				}
			}
			
			return true;
		}
		,any= function(arr){
			var arrLen= arr.length;
			while(arrLen--) {
				if(arr[arrLen]) {
					return true;
				}
			}
			
			return false;
		}
		,filter= function(arr, callback){
			var
				result= []
				,arrLen= arr.length
				,i
			;
			
			for(i= 0; i< arrLen; i++) {
				if(callback.apply(arr[i])) {
					result.push(arr[i]);
				}
			}
			
			return result;
		}
		,map= function(arr, callback){
			var
				result= []
				,arrLen= arr.length
				,i
			;
			
			for (i= 0; i < arrLen; i++) {
				result.push(callback.apply(arr[i]));
			}
			
			return result;
		}
		,bool= function(expr){
			return new Boolean(expr);
		}
		,center= function(value, spaces){
			var
				spacesBefore
				,spacesAfter
			;
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
			
			return value.join('');
		}
		,getattr= function(str, obj, defaultResult){
			var
				found= true
			;
			
			obj= obj || __global__;
			str= str.split('.');
			
			if(str.length > 1) {
				forEach(str, function(){
					if(obj !== undefined) {
						obj= obj[this.concat()];
					} else {
						found = false;
					}
				});
				
				if(!found){
					return defaultResult;
				}
				
				return obj;
			} else {
				return obj[str[0]] || defaultResult;
			}
		}
		,str= function(obj){
			if(obj === undefined) {
				
				return '';
				
			} else if(obj.__str__){
				
				return obj.__str__();
				
			}
			
			return obj.toString();
		}
		,repr= function(obj){
			return obj.__repr__ ? obj.__repr__() : '';
		}
		,len= function(obj){
			// does it have a length attribute?
			if(obj.length !== undefined) {
				return obj.length;
			} else if(obj.__len__){
				return obj.__len__();
			}
			
			return undefined;
		}
		,curry= function(fn) {
			var args = Array.prototype.slice.call(arguments);
			
			return function() {
				return fn.apply(this, args.concat(Array.prototype.slice.call(arguments)));
			};
		}
		,partial= function(fn){
			var args = Array.prototype.slice.call(arguments);
			
			return function(){
				var
					arg = 0
					,i
				;
				
				for (i = 0; i < args.length && arg < arguments.length; i++ ) {
					if ( args[i] === undefined ) {
						args[i] = arguments[arg++];
					}
				}
				
				return fn.apply(this, args);
			}
		}
		
		// js stuff
		
		// string helpers
		,startsWith= function(str, stringToMatch){
			return str.concat().match("^" + stringToMatch) === null ? false : true ;
		}
		,endsWith= function(str, stringToMatch){
			return str.concat().match(stringToMatch + "$") === null ? false : true ;
		}
		,lower= function(str) {
			return str.toLowerCase();
		}
		,upper= function(str) {
			return str.toUpperCase();
		}
		,trim= function(str) {
			var
				newStr= str.replace(/^\s\s*/, ''),
				ws= /\s/,
				i= newStr.length
			;
			
			while(ws.test(newStr.charAt(--i)));
			
			return newStr.slice(0, i + 1);
		}
		,asInt= function(str) {
			return parseInt(str, 10);
		}
		,capitalize= function(str){
			return str.replace(/\w+/g, function(a){
				return a[0].toUpperCase() + a.substr(1).toLowerCase();
			});
		}
		,slugify= function(str) {
			return (str
						.replace(/^\s+/gi,"")
						.replace(/\s+$/gi,"")
						.replace(/\s+/g,'-')
						.replace(/'+/g,'-')
						.toLowerCase());
		}
		,rescape= function(str){
			return str.replace(/(\(|\)|\{|\})/g,'\\$1');
		}
		,bsplit= function(str, path){
			var
				cursor= 0,
				result= []
			;
			
			str.replace(path, function(m1, m2, n){
				result.push(str.slice(cursor, n));
				result.push(m1);
				cursor= n + m1.length;
			});
			
			return result;
		}
		,render= (function(){
			// A modified version of
			// Simple JavaScript Templating
			// John Resig - http://ejohn.org/ - MIT Licensed
			var cache = {};
			
			return function (str, data){
				// Figure out if we're getting a template, or if we need to
				// load the template - and be sure to cache the result.
				var fn = !/\W/.test(str) ?
					cache[this] = cache[this] || document.getElementById(this).innerHTML.render()
					:
					// Generate a reusable function that will serve as a template
					// generator (and which will be cached).
					new Function("obj",
						"var p=[],print=function(){p.push.apply(p,arguments);};" +
						// Introduce the data as local variables using with(){}
						"with(obj){p.push('" +
						// Convert the template into pure JavaScript
						str
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
		})()
		,contains= function(firsStr, secondStr){
			return indexOf(firsStr, secondStr) >= 0;
		}
		,interpolate= function(str, arr){
			// TODO better
			var tmp= str.split('%s');
			for(var i= 0; i< (tmp.length -1); i++) {
				tmp[i] += arr.shift();
			}
			return tmp.join('');
		}
		
		// array helpers
		,last= function(arr, args) {
			if(args){
				arr[arr.length - 1]= args;
				return arr;
			}
			return arr[arr.length - 1];
		}
		,indexOf= function(arr, obj) {
			for (var i = 0; i < arr.length; i++) {
				if (arr[i] === obj) {
					return i;
				}
			}
			return -1;
		}
		,remove= function(arr, from, to) {
			if(typeOf(from) === "array") {
				//from.each(function(){
				forEach(from, function(){
					arr.remove(indexOf(arr, this));
				});
				
				return arr;
			} else {
				var rest = arr.slice((to || from) + 1 || arr.length);
				arr.length = from < 0 ? arr.length + from : from;
				return arr.push.apply(arr, rest);
			}
		}
		,has= function(arr, obj) {
			return indexOf(arr, obj) >= 0;
		}
		,keys= (function(){
			if('keys' in __global__) {
				return keys;
			}
			
			return function(object) {
				var results= [];
				
				forEach(object, function(key){
					results.push(key);
				});
				return results;
			};
		})()
		
		// date helpers
		,formatDate= function(date, format) {
			// borrowed from http://jacwright.com/projects/javascript/date_format
			var
				formatLength= format.length,
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
				}
			;
			
			for(i= 0; i < formatLength; i++) {
				curChar= format.charAt(i);
				
				if(curChar in replace) {
					returnStr+= replace[curChar].call(date);
				} else {
					returnStr+= curChar;
				}
			}
			
			return returnStr;
		}
		
		// random stuff
		
		// a better typeof
		,typeOf= function(obj){
			if(obj === null) {
				return "null";
			} else if(obj === undefined) {
				return "undefined";
			} else if(obj.constructor == String || typeof obj === "string") {
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
			}
			
			return "object";
		}
		,isFunction= function(obj) {
			return typeOf(obj) === "function";
		}
		,isObject= function(obj) {
			return typeOf(obj) === "object";
		}
		,isArray= function(obj) {
			return typeOf(obj) === "array";
		}
		,eq= function(first, second){
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
		}
		,clone= function(obj){
			var key,
				newObj = {};
			
			for(key in obj) {
				if(typeOf(obj[key]) === "array") {
					newObj[key] = clone(obj[key]);
				} else if(typeOf(obj[key]) === "object") {
					newObj[key] = clone(obj[key]);
				}
				
				newObj[key] = obj[key];
			}
			return newObj;
		}
		,random= {
			random: Math.random,
			randrange: function(start, stop, step){
				// TODO
			}
		}
		,extend= function(){
			var 
				name,
				target = arguments[0] || {},
				i = 1,
				length = arguments.length, 
				deep = false,
				options,
				src,
				copy
			;
			
			if(arguments.length > 2) {
				extend.apply(this, arguments.slice(1));
			}
			// copy reference to target object
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
			while(i < length) {
				// Only deal with non-null/undefined values
				if ( (options = arguments[ i ]) !== null ) {
					// Extend the base object
					for ( name in options ) {
						if(options.hasOwnProperty(name)) {
							src = target[ name ];
							copy = options[ name ];
							
							// Prevent never-ending loop
							if ( target === copy ) {
								continue;
							}
							// Recurse if we're merging object values
							if ( deep && copy && typeof copy === "object" && !copy.nodeType ) {
								target[ name ]= extend( deep, src || ( copy.length !== null ? [ ] : { } ), copy );
							}
							
							// Don't bring in undefined values
							else if ( copy !== undefined ) {
								target[ name ] = copy;
							}
						}
					}
				}
				
				i++;
			}
			// Return the modified object
			return target;
		}
		,forEach= function(obj, fn){
			var
				key
				,len
			;
			
			if(typeOf(obj) === "array") {
				for(key= 0, len= obj.length; key < len; key++) {
					fn.apply(obj[key]);
				}
			} else {
				for(key in obj) {
					if(obj.hasOwnProperty(key)) {
						if(fn.call(obj[key], key) === false) {
							
							// if the callback returns false, stops the iteration
							// and return false
							return false;
						}
					}
				}
			}
			
			return true;
		}
	;
	
	extend(__global__, {
		getCallable: getCallable
		,all: all
		,any: any
		,filter: filter
		,map: map
		,bool: bool
		,center: center
		,getattr: getattr
		,curry: curry
		,partial: partial
		,startsWith: startsWith
		,endsWith: endsWith
		,lower: lower
		,upper: upper
		,trim: trim
		,asInt: asInt
		,capitalize: capitalize
		,slugify: slugify
		,rescape: rescape
		,bsplit: bsplit
		,render: render
		,contains: contains
		,interpolate: interpolate
		,last: last
		,indexOf: indexOf
		,remove: remove
		,has: has
		,keys: keys
		,formatDate: formatDate
		,typeOf: typeOf
		,isFunction: isFunction
		,isArray: isArray
		,isObject: isObject
		,eq: eq
		,clone: clone
		,random: random
		,extend: extend
		,forEach: forEach
	});
})(this);
