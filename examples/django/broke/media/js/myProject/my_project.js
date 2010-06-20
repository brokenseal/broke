(function(__global__){
	BROKE_SETTINGS_MODULE= 'myProject.settings';
	
	window.myProject= {
		managers: {},
		models: {},
		templates: {},
		urlPatterns: {},
		settings: {},
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
		}
	};
})(this);
