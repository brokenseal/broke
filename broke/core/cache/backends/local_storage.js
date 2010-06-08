(function(_){
	var
		BaseCache= require('broke/core/cache/backends/base').BaseCache,
		storage= require('broke/core/utils').storage
	;
	
	BaseCache.extend({
		meta: {
			className: 'CacheClass',
			parent: _
		},
		prototype: {
			init: function(args){
				this._super(args);
				this.storage= storage;
			},
			get: function(key, def){
				def= def || null;
				
				return this.storage.getItem(key) || def;
				//return this.storage.getObject(key) || def;
			},
			set: function(key, value, timeout){
				timeout= timeout || this.defaultTimeout;
				
				return this.storage.setItem(key) || def;
				//return this.storage.setObject(key) || def;
			},
			add: function(key, value, timeout){
				return this.set(key, value, timeout);
			},
			'delete': function(key, def){
				return this.removeItem[key] || def;
			},
			clear: function(key, def){
				this.storage.clear();
			}
		}
	});
})(exports);
