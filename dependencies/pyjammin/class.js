/*
 * A pythonic way of declaring classes inspired by John Resig's Class
 * 
 * Declaring a class:
 * var MyClass= Class.create({
 *     __init__: function(kwargs){
 *         if(kwargs.liquor) {
 *             this.myFavoriteLiquor= kwargs.liquor;
 *         } else {
 *             this.alcoholic= false;
 *         }
 *     }
 *     ,alcoholic: true
 * });
 * 
 * var me= MyClass({
 *     liquor: 'Amaretto di Saronno'
 * });
 * var myFriend= MyClass({
 *     liquor: 'Jagermeister'
 * });
 * var myWife= MyClass({
 *     liquor: null
 * });
 * 
 * myWife.alcoholic // false
 * me.alcoholic // true
 * myFriend.myFavoriteLiquor // Jagermeister
 * 
 * P.S. Of course those are only examples...
 */

(function(__global__){
	var
		pyPrototype= {
			__new__: function(kwargs){
				var
					name
					,callableObject
					,_this= this
				;
				
				if ( !initializing && this.__init__ ) {
					this.__init__.apply(this, arguments);
				}
				
				if(!this.__call__) {
					return this;
				}
				
				// allow the new instance of the class to be callable
				// it's good to make callable objects
				callableObject= function(){
					return _this.__call__.apply(_this, arguments);
				};
				
				for(name in this) {
					callableObject[name] = this[name];
				}
				
				return callableObject;
			}
			,__init__: function(kwargs){
				var name;
				
				for(name in kwargs) {
					this[name]= kwargs[name];
				}
				
				return this;
			}
			,__meta__: function(){ throw new NotImplemented() }
			
			,__name__: 'Class'
			,__call__: null
			,__parent__: __global__
			
			,__get__: function(){ throw new NotImplemented() }
			,__set__: function(){ throw new NotImplemented() }
			,__del__: function(){ throw new NotImplemented() }
			
			,__getattr__: function(){ throw new NotImplemented() }
			,__setattr__: function(){ throw new NotImplemented() }
			,__delattr__: function(){ throw new NotImplemented() }
			
			,__iter__: function(){ throw new NotImplemented() }
			
			,__len__: function(){
				// The __len__ method returns the length of the object
				// or the length
				var
					nKeys= 0
					,name
				;
				
				// does it have a length attribute?
				if(this.length !== undefined) {
					return this.length
				}
				
				// find out what's the length of this object based on own properties
				for(name in this) {
					if(this.hasOwnProperty(name)) {
						nKeys+= 1;
					}
				}
				
				return nKeys;
			}
			
			,__repr__: function(){
				return "<" + this.__class__.__name__ + ": " + this.__class__.__name__ + " object>";
			}
			,__str__: function(){
				return this.__repr__.apply(this, arguments);
			}
			,__unicode__: function(){ throw new NotImplemented() }
		}
		,pyStatic= {
			__repr__: function(){
				return "<class " + this.__name__ + ">";
			}
			,__name__: 'Class'
			,__str__: function(){
				return this.__repr__.apply(this, arguments);
			}
			,__unicode__: function(){ throw new NotImplemented() }
		}
		,jsPrototype= {
			toString: function(){
				return this.__repr__.apply(this, arguments);
			}
			//,toLocaleString: function(){}
			//,toSource: function(){}
			//,valueOf: function(){}
		}
		,jsStatic= {
			toString: function(){
				return this.__repr__.apply(this, arguments);
			}
		}
		,NotImplemented= new Error('Not implemented.')
		,initializing= false
		,fnTest= /xyz/.test(function(){var xyz;}) ? /\b_super\b/ : /.*/
		,Class= function(kwargs){
			return;
			// not sure about this
			/*if(!(this instanceof Class)) {
				return Class.create(kwargs);
			}*/
		}
	;
	
	// Create a new Class that inherits from the current class.
	Class.create= function(kwargs) {
		var
			_super_class= this
			,_super= this.prototype
			,prototype
			,klass= {}
			,name
			,__class__
		;
		
		// build the static properties
		for(name in pyStatic) {
			klass[name]= pyStatic[name];
		}
		for(name in jsStatic) {
			klass[name]= jsStatic[name];
		}
		for(name in kwargs) {
			if(kwargs[name] && kwargs[name].staticMethod) {
				klass[name]= kwargs[name];
				delete kwargs[name];
			}
		}
		
		// build the prototype
		for(name in pyPrototype) {
			if(!kwargs.hasOwnProperty(name)) {
				kwargs[name]= pyPrototype[name];
			}
		}
		for(name in jsPrototype) {
			if(!kwargs.hasOwnProperty(name)) {
				kwargs[name]= jsPrototype[name];
			}
		}
		
		// The dummy class constructor
		// All construction is actually done in the init method
		__class__= function(kwargs){
			if(!(this instanceof arguments.callee)) {
				return new arguments.callee(kwargs);
			}
			
			return this.__new__(kwargs);
		};
		
		// attach the static properties
		for(name in klass) {
				// Copy the static methods over onto the class
				__class__[name] = typeof klass[name] == "function" && typeof __class__[name] == "function" && fnTest.test(klass[name]) ?
					(function(name, fn){
						return function() {
							var
								tmp= this._super
								,ret
							;
							
							this._super= _super_class[name];
							ret= fn.apply(this, arguments);
							this._super= tmp;
							
							return ret;
						};
					})(name, klass[name])
					:
					klass[name];
		}
		
		// Instantiate a base class (but only create the instance,
		// don't run the init constructor)
		initializing= true;
		prototype= new this();
		initializing= false;
		
		for(name in kwargs) {
			// Copy the properties over onto the new prototype
			// Check if we're overwriting an existing function
			prototype[name]= typeof kwargs[name] == "function" && typeof _super[name] == "function" && fnTest.test(kwargs[name]) ?
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
				})(name, kwargs[name])
				:
				kwargs[name];
		}
		
		// Populate our constructed prototype object
		__class__.prototype= prototype;
		__class__.prototype.__class__= __class__;
		
		// Enforce the constructor to be what we expect
		__class__.constructor= __class__;
		
		// And make this class extendable
		for(name in this){
			if(this.hasOwnProperty(name) && name != 'prototype'){
				__class__[name] = this[name];
			}
		}
		__class__.create= arguments.callee;
		
		if(kwargs.__name__) {
			var
				current= kwargs.__parent__,
				parts= kwargs.__name__.split(/\./)
			;
			
			for(i= 0; i < parts.length - 1; i++){
				current = current[parts[i]] || ( current[parts[i]] = {} );
			}
			
			current[parts[parts.length - 1]]= __class__;
			__class__.__name__= parts[parts.length - 1];
		}
		
		// class initialisation
		if(__class__.__init__) {
			__class__.__init__(__class__);
		}
		
		if(_super_class.extended) {
			_super_class.extended(__class__);
		}
		
		return __class__;
	};
	
	__global__.Class= Class;
})(this);
