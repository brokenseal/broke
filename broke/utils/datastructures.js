(function(_){
	var
		Class= require('dependencies/pyjammin/class').Class,
		Exception= require('broke/core/exceptions').Exception
	;
	
	Exception.extend({
		meta: {
			className: 'MultiValueDictKeyError',
			parent: _
		},
		prototype: {
			init: function(message){
				this._super(message);
			}
		}
	});

	Class.extend({
		__name__: 'MultiValueDict'
		,__parent__: _
		,__init__: function(){
			/*
				An object customized to handle multiple values for the same key.
				
				>>> d = MultiValueDict({'name': ['Adrian', 'Simon'], 'position': ['Developer']})
				>>> d['name']
				'Simon'
				>>> d.getlist('name')
				['Adrian', 'Simon']
				>>> d.get('lastname', 'nonexistent')
				'nonexistent'
				>>> d.setlist('lastname', ['Holovaty', 'Willison'])
				
				This class exists to solve the irritating problem raised by cgi.parse_qs,
				which returns a list for every key, even though most Web forms submit
				single name-value pairs.
			*/
			
			this.dict= {};
		},
		get: function(key, defaultValue){
			// Returns the last data value for the passed key. If key doesn't exist
			// or value is an empty list, then default is returned.
			
			try {
				return utils.last(this.dict[key]) || defaultValue;
			} catch(e) {}
			
			return defaultValue;
		},
		getList: function(key, defaultValue){
			// Returns the list of values for the passed key. If key doesn't exist,
			// then an empty list is returned.
			
			try {
				return utils.last(this.dict[key]) || defaultValue || [];
			} catch(e) {}
			
			return defaultValue || [];
		},
		setList: function(key, list){
			this.dict[key]= list;
			
			return list;
		},
		setDefault: function(key, defaultValue){
			if((!key in this.dict)) {
				this.dict[key]= defaultValue || null;
			}
			
			return this.get[key];
		},
		setListDefault: function(key, defaultList) {
			if((!key in this.dict)) {
				this.setlist[key]= defaultList || [];
			}
			
			return this.getlist[key];
		},
		appendList: function(key, value){
			// Appends an item to the internal list associated with key
			this.getList(key).push(value);
			
			return value;
		},
		items: function(){
			// Returns a list of [ key, value ] pairs, where value is the last item in
			// the list associated with the key.
			var
				result= [],
				key
			;
			
			for(key in this.dict) {
				result.push([ key, this.get(key) ]);
			}
			
			return result;
		},
		lists: function(){
			// Returns a list of (key, list) pairs."""
			// Returns a list of [ key, value ] pairs, where value is the last item in
			// the list associated with the key.
			var
				result= [],
				key
			;
			
			for(key in this.dict) {
				result.push([ key, this.getlist(key) ]);
			}
			
			return result;
		},
		values: function(){
			// Returns a list of the last value on every key list
			var
				result= [],
				key
			;
			
			for(key in this.dict) {
				result.push(this.get(key));
			}
		}
	});
	
})(exports);
