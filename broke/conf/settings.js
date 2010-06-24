(function(_){
	var
		Class= require('dependencies/class').Class
		,globalSettings= require('broke/conf/global_settings')
		//,LazyObject= require('broke/utils/functional').LazyObject
		,utils= require('broke/core/utils')
		,gettext= require('dependencies/gettext').gettext.gettext
		,exceptions= require('broke/core/exceptions')
		,ImportError= exceptions.ImportError
		,KeyError= exceptions.KeyError
		,RunTimeError= exceptions.RunTimeError
		,ENVIRONMENT_VARIABLE= 'BROKE_SETTINGS_MODULE'
		,settings
	;
	
	/*
	A lazy proxy for either global Django settings or a custom settings object.
	The user can manually configure settings prior to using them. Otherwise,
	Django uses the settings module pointed to by DJANGO_SETTINGS_MODULE.
	*/
	/*LazyObject.extend({
		meta: {
			className: 'LazySettings'
			,parent: _
		}
		,prototype: {
			_setup: function(){
				// Load the settings module pointed to by the environment variable. This
				// is used the first time we need any settings at all, if the user has not
				// previously configured the settings manually.
				var
					settingsModule= global[ENVIRONMENT_VARIABLE]
				;
				
				if(ENVIRONMENT_VARIABLE in global && settingsModule === undefined) {
					throw new KeyError();
				} else {
					throw new ImportError(gettext('Settings cannot be imported, because global variable %s is undefined." % ENVIRONMENT_VARIABLE').echo(ENVIRONMENT_VARIABLE));
				}
				
				this._wrapped= _.Settings(settingsModule);
			}
			,configure: function(defaultSettings, options){
				// Called to manually configure the settings. The 'default_settings'
				// parameter sets where to retrieve any unspecified values from.
				var
					holder
				;
				
				if(this._wrapped) {
					throw new RunTimeError(gettext('Settings already configured.'));
				}
				
				holder= UserSettingsHolder(defaultSettings);
				
				utils.extend(holder, options);
				
				this._wrapped= holder;
			}
			,configured: function(){
				// Returns True if the settings have already been configured.
				
				return utils.bool(this._wrapped);
			}
		}
	});
	*/
	
	Class.extend({
		meta: {
			className: 'Settings'
			,parent: _
		}
		,prototype: {
			init: function(settingsModule){
				// update this object from global settings (but only for ALL_CAPS settings)
				var
					_this= this
					,mod
				;
				
				utils.forEach(globalSettings, function(name){
					if(name == name.toUpperCase()) {
						_this[name]= this;
					}
				});
				
				// store the settings module in case someone later cares
				this.SETTINGS_MODULE= settingsModule;
				
				mod= require(settingsModule);
				
				if(!mod) {
					throw new ImportError(gettext("Could not import settings '%s' (Is it on sys.path? Does it have syntax errors?)".echo(this.SETTINGS_MODULE)));
				}
				
				// I'm not going to translate the tuple_settings because I strongly believe it's a mistake
				
				utils.forEach(mod, function(name){
					if(name == name.toUpperCase()) {
						_this[name]= this;
					}
				});
				
				// Expand entries in INSTALLED_APPS like "django.contrib.*" to a list
				// of all those apps.
				// TODO
				
				// TIME_ZONE stuff
				// TODO
			}
		}
	});
	
	// Holder for user configured settings.
	Class.extend({
		meta: {
			className: 'UserSettingsHolder'
			,parent: _
		}
		,prototype: {
			init: function(defaultSettings){
				// Requests for configuration variables not in this class are satisfied
				// from the module specified in default_settings (if possible).
				
				this.defaultSettings= defaultSettings;
			}
		}
	});
	
	// settings= new _.LazySettings(); -> can't to that in Javascript (?)
	settings= new _.Settings(global[ENVIRONMENT_VARIABLE]);
	
	utils.extend(_, {
		ENVIRONMENT_VARIABLE: ENVIRONMENT_VARIABLE
		,settings: settings
	});
})(exports);
