(function(_){
	var
		Class= require('dependencies/class').Class
	;
	
	Class.extend.call(Error, {
		meta: {
			className: 'Exception',
			parent: _
		},
		prototype: {
			init: function(message){
				this.message= message;
				this.name= this.Class.className;
			}
		}
	});
	
	_.Exception.extend({
		meta: {
			className: 'DoesNotExist',
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
			className: 'FieldDoesNotExist',
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
			className: 'MultipleObjectsReturned',
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
			className: 'InvalidCacheBackendError',
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
			className: 'ImproperlyConfigured',
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
			className: 'GenericError',
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
			className: 'NoReverseMatch',
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
			className: 'NotImplementedError',
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
			className: 'NotFound',
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
			className: 'PermissionDenied',
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
			className: 'VariableDoesNotExist',
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
			className: 'TemplateEncodingError',
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
			className: 'TemplateDoesNotExist',
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
			className: 'TemplateSyntaxError',
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
			className: 'SettingsObjectNotDefined',
			parent: _
		},
		prototype: {
			init: function(message){
				this._super(message);
			}
		}
	});
})(exports);
