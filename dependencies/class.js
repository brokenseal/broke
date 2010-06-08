/*
 * This is a modified version of John Resig's 'Class', it provides class level
 * inheritence and callbacks.
 * It's been written by the guys behind the 'Javascript MVC' framework and
 * modified by me, Davide Callegari ( http://www.brokenseal.it/ )
 *
 * John Resig: http://ejohn.org/
 * Javascript MVC: http://javascriptmvc.com/
 *
 */


(function(__global__){
	var
		initializing= false,
		fnTest= /xyz/.test(function(){var xyz;}) ? /\b_super\b/ : /.*/,
		callback= function(f_names){
			//process args
			var
				args = Array.prototype.slice.call(arguments),
				self
			;
			
			f_names = args.shift();
			if(!(f_names instanceof Array)) {
				f_names = [f_names];
			}
			
			//check names ... should only be in development
			//for(f =0; f < f_names.length; f++ )
			//	if(typeof f_names[f] == "string" &&  typeof this[f_names[f]] != 'function')
			//		 throw 'There is no function named '+f_names[f]+'. ';
			self= this;
			return function(){
				var
					cur = args.concat(Array.prototype.call(arguments)),
					f,
					isString
				;
				
				for(f =0; f < f_names.length; f++){
					if(!f_names[f]) {
						continue;
					}
					
					isString = (typeof f_names[f] == "string");
					if(isString && self._set_called) {
						self.called = f_names[f];
					}
					
					cur= (isString ? self[f_names[f]] : f_names[f]).apply(self, cur);
					if(!cur) {
						cur = [];
					}
					else if( !(cur instanceof Array) || cur._use_call) {
						cur = [cur];
					}
				}
				return cur;
			};
		},
		Class
	;
	
	Class = function(metaClass){
		if(!(this instanceof Class)) {
			return Class.extend(metaClass);
		}
	};
	Class.callback = callback;
	
	// Create a new Class that inherits from the current class.
	Class.extend = function(metaClass) {
		var
			_super_class,
			_super,
			prototype,
			name,
			i,
			meta= metaClass.meta || {},
			klass= metaClass.klass || {},
			proto= metaClass.prototype || {}
		;
		
		_super_class= this;
		_super= this.prototype;
		
		// Instantiate a base class (but only create the instance,
		// don't run the init constructor)
		initializing= true;
		prototype= new this();
		initializing= false;
		
		// customize the result of the toString method on the class
		proto.toString= proto.__str__ || function(){
			return "<" + this.Class.className + ": " + this.Class.className + " object>";
		};
		
		// Copy the properties over onto the new prototype
		for(name in proto) {
			// Check if we're overwriting an existing function
			prototype[name]= typeof proto[name] == "function" && typeof _super[name] == "function" && fnTest.test(proto[name]) ?
				(function(name, fn){
					return function() {
						var tmp = this._super,
							ret;
						
						// Add a new ._super() method that is the same method
						// but on the super-class
						this._super= _super[name];
						
						// The method only need to be bound temporarily, so we
						// remove it when we're done executing
						ret= fn.apply(this, arguments);
						this._super= tmp;
						
						return ret;
					};
				})(name, proto[name])
				:
				proto[name];
		}
		
		// The dummy class constructor
		// All construction is actually done in the init method
		function Class() {
			if ( !initializing && this.init ) {
				this.init.apply(this, arguments);
			}
		}
		
		// Populate our constructed prototype object
		Class.prototype= prototype;
		Class.prototype.Class= Class;
		
		// Enforce the constructor to be what we expect
		Class.constructor= Class;
		
		// And make this class extendable
		for(name in this){
			if(this.hasOwnProperty(name) && name != 'prototype'){
				Class[name] = this[name];
			}
		}
		
		klass= klass || {};
		// customize the result of the toString method on the class
		klass.toString= klass.__str__ || function(){
			return "<class '" + this.fullName + "'>";
		};
		
		for(name in klass) {
		  Class[name] = typeof klass[name] == "function" &&
			typeof Class[name] == "function" && fnTest.test(klass[name]) ?
			(function(name, fn){
				return function() {
					var tmp= this._super,
						ret;
					
					this._super= _super_class[name];
					ret= fn.apply(this, arguments);
					this._super= tmp;
					
					return ret;
				};
			})(name, klass[name]) :
			klass[name];
		}
		
		Class.newInstance = function(){
			var inst = new Class();
			
			initializing = true;
			initializing = false;
			if(inst.init) {
				inst.init.apply(inst, arguments);
			}
			return inst;
		};
		
		Class.extend= arguments.callee;
		
		if(meta.className) {
			var
				current= meta.parent || __global__,
				parts= meta.className.split(/\./)
			;
			
			for(i= 0; i < parts.length - 1; i++){
				current = current[parts[i]] || ( current[parts[i]] = {} );
			}
			
			current[parts[parts.length - 1]]= Class;
			Class.className= parts[parts.length - 1];
			Class.fullName= meta.className;
		}
		
		if(Class.init) {
			Class.init(Class);
		}
		
		if(_super_class.extended) {
			_super_class.extended(Class);
		}
		return Class;
	};

	Class.prototype = {
		callback : callback
	};
	
	__global__.Class= Class;
})(this);
