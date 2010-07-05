(function(_){
	var
		Class= require('dependencies/pyjammin/class').Class
		,Exception= Class.create.call(Error, {
			__name__: 'Exception'
			,__parent__: _
			,__init__: function(message){
				this.message= message;
				this.name= this.__class__.__name__;
			}
		})
	;
	
	Exception.create({
		__name__: 'RunTimeError'
		,__parent__: _
		,__init__: function(message){
			this._super(message);
		}
	});
	
	Exception.create({
		__name__: 'DoesNotExist'
		,__parent__: _
		,__init__: function(message){
			this._super(message);
		}
	});
	
	Exception.create({
		__name__: 'FieldDoesNotExist'
		,__parent__: _
		,__init__: function(message){
			this._super(message);
		}
	});
	
	Exception.create({
		__name__: 'MultipleObjectsReturned'
		,__parent__: _
		,__init__: function(message){
			this._super(message);
		}
	});
	
	Exception.create({
		__name__: 'InvalidCacheBackendError'
		,__parent__: _
		,__init__: function(message){
			this._super(message);
		}
	});
	
	Exception.create({
		__name__: 'ImproperlyConfigured'
		,__parent__: _
		,__init__: function(message){
			this._super(message);
		}
	});
	
	Exception.create({
		__name__: 'GenericError'
		,__parent__: _
		,__init__: function(message){
			this._super(message);
		}
	});
	
	Exception.create({
		__name__: 'NoReverseMatch'
		,__parent__: _
		,__init__: function(message){
			this._super(message);
		}
	});
	
	Exception.create({
		__name__: 'NotImplementedError'
		,__parent__: _
		,__init__: function(message){
			this._super(message);
		}
	});
	
	Exception.create({
		__name__: 'NotFound'
		,__parent__: _
		,__init__: function(message){
			this._super(message);
		}
	});
	
	Exception.create({
		__name__: 'PermissionDenied'
		,__parent__: _
		,__init__: function(message){
			this._super(message);
		}
	});
	
	Exception.create({
		__name__: 'VariableDoesNotExist'
		,__parent__: _
		,__init__: function(message){
			this._super(message);
		}
	});
	
	Exception.create({
		__name__: 'TemplateEncodingError'
		,__parent__: _
		,__init__: function(message){
			this._super(message);
		}
	});
	
	Exception.create({
		__name__: 'TemplateDoesNotExist'
		,__parent__: _
		,__init__: function(message){
			this._super(message);
		}
	});
	
	Exception.create({
		__name__: 'TemplateSyntaxError'
		,__parent__: _
		,__init__: function(message){
			this._super(message);
		}
	});
	
	Exception.create({
		__name__: 'SettingsObjectNotDefined'
		,__parent__: _
		,__init__: function(message){
			this._super(message);
		}
	});
})(exports);
