(function(_){
	var
		utils= require('broke/core/utils'),
		exceptions= require('broke/core/exceptions'),
		ImproperlyConfigured= exceptions.ImproperlyConfigured,
		NotImplementedError= exceptions.NotImplementedError,
		Class= require('dependencies/class').Class
	;
	
	Class.extend({
		meta: {
			name: 'BaseCache',
			parent: _
		},
		prototype: {
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
				utils.forEach(keys, function(){
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
				
				utils.forEach(data, function(key){
					_this.set(key, this, timeout);
				});
			},
			deleteMany: function(keys){
				var _this= this;
				
				//keys.each(function(){
				//	_this['delete'](this);
				//});
				utils.forEach(keys, function(){
					_this['delete'](this);
				});
			},
			clear: function(){
				throw NotImplementedError();
			}
		}
	});
})(exports);
