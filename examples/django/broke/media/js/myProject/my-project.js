(function(){
	var languageCode= window.location.href.split('?switch_lang=')[1] || 'it';
	
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
				models: {}
			},
			gettext_test: {
				models: {}
			},
			rss_reader: {
				models: {}
			}
		},
		settings: {
			MIDDLEWARE_CLASSES: [
				'myProject.middleware.NextPageMiddleware',
				'broke.middleware.CommonMiddleware',
				'broke.middleware.AddressBarMiddleware'
			],
			ADDRESS_BAR: {
				hide: false
			},
			LANGUAGE_CODE: languageCode,
			BASE_URL: 'http://demo.brokenseal.it/media/broke/broke',
			LOCALE_PATHS: [
				'http://demo.brokenseal.it/media/js/myProject'
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
