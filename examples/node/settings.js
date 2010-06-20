(function(_){
	var
		utils= require('broke/core/utils')
		,hostname= require('url').hostname
		,HOSTMAP = {
			'development': [
				'localhost'
			]
			,'staging': [
				'demo.brokenseal.it'
			]
			,'production': [
	//			'demo.brokenseal.it'
			]
		}
		,production = {
			REQUIRE: {
				DYNAMIC: true
				,TIMEOUT: 3600
				,PATHS: ['/media/broke']
			}
			,MIDDLEWARE_CLASSES: [
				'broke.middleware.common.CommonMiddleware'
			]
			,DEBUG_PROPAGATE_EXCEPTIONS: true
			,ADDRESS_BAR: {
				hide: false
			}
			,LANGUAGE_CODE: 'it'
			,BASE_URL: '/media/broke/broke'
			,LOCALE_PATHS: [
				'/broke/examples/node/locale'
			]
			,TEMPLATE_PATHS: [
				'/broke/examples/node/templates'
			]
			,TEMPLATE_LOADERS: [
				'broke.template.loaders.apps',
				'broke.template.loaders.remote'
			]
			,USE_I18N: true
			,DEBUG: false
			,GET_LATEST_BY: 'title'
			,INSTALLED_APPS: [
				'project'
			]
			,ROOT_URLCONF: '/media/broke/examples/node/urls'
		}
		,development= utils.extend(utils.clone(production), {
			BASE_URL: '/broke'
			,LOCALE_PATHS: [
				'/broke/examples/node/locale'
			]
			,TEMPLATE_PATHS: [
				'/broke/examples/node/templates'
			]
			,ROOT_URLCONF: 'examples/node/urls'
		})
		,settings= {
			development: development
			,staging: production
			,production: production
		}
	;
	
	utils.forEach(HOSTMAP, function(key){
		utils.forEach(this, function(){
			
			if(hostname == this) {
				utils.extend(exports, settings[key]);
			}
			
		});
	});
})(exports);
