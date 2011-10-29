(function(__global__){
	var
		utils= require('broke/core/utils'),
		HOSTMAP = {
			'development': [
				'broke'
			],
			'staging': [
				'demo.brokenseal.it',
			],
			'production': [
	//			'demo.brokenseal.it',
			]
		},
		production = {
			REQUIRE: {
				DYNAMIC: true,
				TIMEOUT: 3600,
				PATHS: ['/media/broke']
			},
			MIDDLEWARE_CLASSES: [
//				'myProject.middleware.NextPageMiddleware',
//				'broke.middleware.cache.CacheMiddleware',
//				'broke.middleware.common.AddressBarMiddleware',
				'broke.middleware.common.CommonMiddleware'
			],
			DEBUG_PROPAGATE_EXCEPTIONS: true,
			ADDRESS_BAR: {
				hide: false
			},
			LANGUAGE_CODE: 'it',
			BASE_URL: 'http://demo.brokenseal.it/media/broke/broke',
			LOCALE_PATHS: [
				'http://demo.brokenseal.it/media/js/myProject'
			],
			TEMPLATE_PATHS: [
				'http://demo.brokenseal.it/media/js/myProject/templates'
			],
			TEMPLATE_LOADERS: [
				'broke.template.loaders.apps',
				'broke.template.loaders.remote'
			],
			USE_I18N: true,
			DEBUG: false,
			GET_LATEST_BY: 'title',
			INSTALLED_APPS: [
				'myProject.apps.blog',
				'myProject.apps.gettext_test',
				'myProject.apps.rss_reader',
			],
			ROOT_URLCONF: 'myProject.urlPatterns'
		},
		development= utils.extend(clone(production), {
			BASE_URL: 'http://broke/media/broke/broke',
			LOCALE_PATHS: [
				'http://broke/media/js/myProject'
			],
			TEMPLATE_PATHS: [
				'http://broke/media/js/myProject/templates'
			]
		}),
		settings= {
			development: development,
			staging: production,
			production: production
		}
	;

	utils.forEach(HOSTMAP, function(key){
		utils.forEach(this, function(){

			if(__global__.location.host == this) {
				utils.extend(myProject.settings, settings[key]);
			}

		});
	});
})(this);
