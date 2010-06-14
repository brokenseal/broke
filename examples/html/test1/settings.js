(function(_){
	var
		utils= require('broke/core/utils')
		,HOSTMAP = {
			'development': [
				'callegari'
			],
			'staging': [
				'demo.brokenseal.it'
			],
			'production': [
	//			'demo.brokenseal.it'
			]
		}
		,production = {
			REQUIRE: {
				DYNAMIC: true
				,TIMEOUT: 3600
				,PATHS: ['/media/broke']
			},
			MIDDLEWARE_CLASSES: [
				'broke.middleware.common.CommonMiddleware'
			],
			DEBUG_PROPAGATE_EXCEPTIONS: true,
			ADDRESS_BAR: {
				hide: false
			},
			LANGUAGE_CODE: 'it',
			BASE_URL: 'http://demo.brokenseal.it/media/broke/broke',
			LOCALE_PATHS: [
				'/media/js/myProject'
			],
			TEMPLATE_PATHS: [
				'/media/js/myProject/templates'
			],
			TEMPLATE_LOADERS: [
				'broke.template.loaders.apps',
				'broke.template.loaders.remote'
			],
			USE_I18N: true,
			DEBUG: false,
			GET_LATEST_BY: 'title'
			,INSTALLED_APPS: []
			,ROOT_URLCONF: '/media/broke/examples/html/test1'
		}
		,development= utils.extend(utils.clone(production), {
			BASE_URL: '/broke'
			,LOCALE_PATHS: [
				'/broke/examples/html/test1/locale'
			]
			,TEMPLATE_PATHS: [
				'/broke/examples/html/test1'
			]
			,ROOT_URLCONF: 'examples/html/test1/urls'
		})
		,settings= {
			development: development,
			staging: production,
			production: production
		}
	;
	
	utils.forEach(HOSTMAP, function(key){
		utils.forEach(this, function(){
			
			if(location && location.host == this) {
				utils.extend(exports, settings[key]);
			}
			
		});
	});
})(exports);
