(function(__global__){
	broke.BROKE_SETTINGS_OBJECT= 'myProject.settings';
	
	__global__.myProject= {
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
		}
	};
})(this);
