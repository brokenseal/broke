(function(__global__){
	var 
		__module__ = {},
		
		ImproperlyConfigured= broke.core.exceptions.ImproperlyConfigured,
		NotImplementedError= broke.core.exceptions.NotImplementedError,
		Class= broke.Class
	;
	
	BaseCache= Class.extend('this.BaseCache', {
		init: function(args){
			args.timeout= args.timeout || 300;
			
			this.defaultTimeout= args.timeout;
		},
		add: function(){
			throw NotImplementedError();
		},
		get: function(){
			throw NotImplementedError();
		},
		set: function(){
			throw NotImplementedError();
		},
		'delete': function(){
			throw NotImplementedError();
		},
		getMany: function(keys){
			var _this= this,
				result= {};
			
			//keys.each(function(){
			//	var value= _this.get(this);
			//	
			//	if(value !== null) {
			//		result[this]= value;
			//	}
			//});
			forEach(keys, function(){
				var value= _this.get(this);
				
				if(value !== null) {
					result[this]= value;
				}
			});
			
			return result;
		},
		hasKey: function(key){
			return this.get(key) !== null;
		},
		incr: function(){
			// TODO
		},
		decr: function(){
			// TODO
		},
		setMany: function(data, timeout){
			var _this= this;
			
			timeout= timeout || null;
			
			forEach(data, function(key){
				_this.set(key, this, timeout);
			});
		},
		deleteMany: function(keys){
			var _this= this;
			
			//keys.each(function(){
			//	_this['delete'](this);
			//});
			forEach(keys, function(){
				_this['delete'](this);
			});
		},
		clear: function(){
			throw NotImplementedError();
		}
	});
	
	__module__= {
		BaseCache: BaseCache
	};
	
	broke.core.cache.base= __module__;
	return __module__;
})(this);
