(function(){
	var BaseCache= broke.core.cache.base.BaseCache;
	
	BaseCache.extend('broke.core.cache.backends.localStorage.CacheClass', {
		init: function(args){
			this._super(args);
			this.storage= broke.localStorage;
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
	});
})();
