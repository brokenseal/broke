var myProject= {
	managers: {},
	models: {},
	templates: {},
	urlPatterns: {},
	middleware: {
		NextPageMiddleware: {
			processResponse: function(response){
				if('queryData' in response) {
					if('next' in response.queryData) {
						$(window).trigger('broke.request', [{
							url: response.queryData['next']
						}]);
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
		debug: true,
		getLatestBy: 'title',
		installedApps: [
			'myProject.apps.blog',
		]
	}
};

// project register
broke.registerProject(myProject);
