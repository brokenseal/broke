var myProject= {};

(function(){
	var languageCode= window.location.href.split('?switch_lang=')[1] || 'it';
	
	myProject= {
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
			middleware: [
				'myProject.middleware.NextPageMiddleware',
				'broke.middleware.CommonMiddleware',
				'broke.middleware.AddressBarMiddleware'
			],
			addressBar: {
				hide: false
			},
			languageCode: languageCode,
			baseUrl: 'http://demo.brokenseal.it/media/broke/broke',
			localePaths: [
				'http://demo.brokenseal.it/media/js/myProject'
			],
			usei18n: true,
			debug: true,
			getLatestBy: 'title',
			installedApps: [
				'myProject.apps.blog',
			]
		}
	};
	
	// project register
	broke.registerProject(myProject);
})();
