(function(_){
	
	Class.extend.call(Error, {
		meta: {
			name: 'Exception',
			parent: _
		},
		prototype: {
			init: function(message){
				this.message= message;
				this.name= this.Class.name;
			}
		}
	});
	
	_.Exception.extend({
		meta: {
			name: 'DoesNotExist',
			parent: _
		},
		prototype: {
			init: function(message){
				this._super(message);
			}
		}
	});
	
	_.Exception.extend({
		meta: {
			name: 'FieldDoesNotExist',
			parent: _
		},
		prototype: {
			init: function(message){
				this._super(message);
			}
		}
	});
	
	_.Exception.extend({
		meta: {
			name: 'MultipleObjectsReturned',
			parent: _
		},
		prototype: {
			init: function(message){
				this._super(message);
			}
		}
	});
	
	_.Exception.extend({
		meta: {
			name: 'InvalidCacheBackendError',
			parent: _
		},
		prototype: {
			init: function(message){
				this._super(message);
			}
		}
	});
	
	_.Exception.extend({
		meta: {
			name: 'ImproperlyConfigured',
			parent: _
		},
		prototype: {
			init: function(message){
				this._super(message);
			}
		}
	});
	
	_.Exception.extend({
		meta: {
			name: 'GenericError',
			parent: _
		},
		prototype: {
			init: function(message){
				this._super(message);
			}
		}
	});
	
	_.Exception.extend({
		meta: {
			name: 'NoReverseMatch',
			parent: _
		},
		prototype: {
			init: function(message){
				this._super(message);
			}
		}
	});
	
	_.Exception.extend({
		meta: {
			name: 'NotImplementedError',
			parent: _
		},
		prototype: {
			init: function(message){
				this._super(message);
			}
		}
	});
	
	_.Exception.extend({
		meta: {
			name: 'NotFound',
			parent: _
		},
		prototype: {
			init: function(message){
				this._super(message);
			}
		}
	});
	
	_.Exception.extend({
		meta: {
			name: 'PermissionDenied',
			parent: _
		},
		prototype: {
			init: function(message){
				this._super(message);
			}
		}
	});
	
	_.Exception.extend({
		meta: {
			name: 'VariableDoesNotExist',
			parent: _
		},
		prototype: {
			init: function(message){
				this._super(message);
			}
		}
	});
	
	_.Exception.extend({
		meta: {
			name: 'TemplateEncodingError',
			parent: _
		},
		prototype: {
			init: function(message){
				this._super(message);
			}
		}
	});
	
	_.Exception.extend({
		meta: {
			name: 'TemplateDoesNotExist',
			parent: _
		},
		prototype: {
			init: function(message){
				this._super(message);
			}
		}
	});
	
	_.Exception.extend({
		meta: {
			name: 'TemplateSyntaxError',
			parent: _
		},
		prototype: {
			init: function(message){
				this._super(message);
			}
		}
	});
	
	_.Exception.extend({
		meta: {
			name: 'SettingsObjectNotDefined',
			parent: _
		},
		prototype: {
			init: function(message){
				this._super(message);
			}
		}
	});
})(exports);
