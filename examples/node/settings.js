(function(_){
	var
		utils= require('broke/core/utils')
		,platform= process.platform
		,HOSTMAP = {
			'development': [
				'localhost'
				,'linux2'
			]
			,'development_home': [
				,'darwin'
			]
			,'staging': [
				'linux2'
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
			,TEMPLATE_DIRS: [
				'/var/www/js/broke/examples/node/templates'
			]
			,TEMPLATE_LOADERS: [
				'broke.template.loaders.filesystem'
			]
			,USE_I18N: true
			,DEBUG: false
			,GET_LATEST_BY: 'title'
			,INSTALLED_APPS: [
				'project'
			]
			,ROOT_URLCONF: 'examples/node/urls'
			,MEDIA_ROOT: '/var/www/js/broke/examples/node/static'
			,APPEND_SLASH: true
		}
		,development= utils.extend(utils.clone(production), {
			BASE_URL: '/broke'
			,LOCALE_PATHS: [
				'/broke/examples/node/locale'
			]
			,TEMPLATE_DIRS: [
				'/var/www/js/broke/examples/node/templates'
			]
			,ROOT_URLCONF: 'examples/node/urls'
			,MEDIA_ROOT: '/var/www/js/broke/examples/node/static'
		})
		,development_home= utils.extend(utils.clone(production), {
			BASE_URL: '/broke'
			,LOCALE_PATHS: [
				'/opt/local/apache2/htdocs/js/broke/examples/node/locale'
			]
			,TEMPLATE_DIRS: [
				'/opt/local/apache2/htdocs/js/broke/examples/node/templates'
			]
			,ROOT_URLCONF: 'examples/node/urls'
		})
		,settings= {
			development: development
			,development_home: development_home
			,staging: production
			,production: production
		}
	;
	
	utils.forEach(HOSTMAP, function(key){
		utils.forEach(this, function(){
			
			if(platform == this) {
				utils.extend(exports, settings[key]);
			}
			
		});
	});
})(exports);
