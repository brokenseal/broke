(function(){
	broke.BROKE_SETTINGS_OBJECT= 'myProject.settings';
	
	window.myProject= {
		managers: {},
		models: {},
		templates: {},
		urlPatterns: {},
		middleware: {
			NextPageMiddleware: {
				processResponse: function(response){
					if('queryData' in response) {
						if('next' in response.queryData) {
							broke.request(response.queryData['next']);
						}
					}
				}
			}
		},
		views: {},
		apps: {
			blog: {
				models: {},
				views: {}
			},
			gettext_test: {
				models: {},
				views: {}
			},
			rss_reader: {
				models: {},
				views: {}
			}
		},
		settings: {
			MIDDLEWARE_CLASSES: [
				'broke.middleware.common.CommonMiddleware',
				'myProject.middleware.NextPageMiddleware',
				'broke.middleware.cache.CacheMiddleware',
				'broke.middleware.common.AddressBarMiddleware'
			],
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
				'broke.template.loaders.remote',
			],
			USE_I18N: true,
			DEBUG: true,
			GET_LATEST_BY: 'title',
			INSTALLED_APPS: [
				'myProject.apps.blog',
				'myProject.apps.gettext_test',
				'myProject.apps.rss_reader',
			],
			ROOT_URLCONF: 'myProject.urlPatterns'
		}
	};
	
})();
