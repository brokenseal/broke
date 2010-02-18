/****************************************************************************/
/******************************* SETTINGS ***********************************/
/****************************************************************************/

broke.extend({
	settings: {
		ajax: {							// ajax settings
			dataType: 'json',			// ajax data type which returns from the server
			async: false
		},
		
		// 'eventTriggeringMethod' determines the way to trigger the
		// broke.request event, choices are: elements, hashchange
		// WARNING: hashChange will work with an interval of 150ms on old browsers
		// on more recent browsers will make use of the 'onhashchange' event
		// which, by the time of the writing, it is only available on Firefox 3.6 and IE8
		// as for the 'elements' method please refer to the documentation under the
		// 'events' topic
		eventTriggeringMethod: 'elements',
		
		baseUrl: '/broke',
		debug: false,
		contextProcessors: [
			'broke.contextProcessors.debug'
		],
		
		dateFormat: '%Y/%m/%d',
		eventBinding: 'live',			// bind|live
										// it should always be set to 'live' but
										// at the current stage jQuery's live
										// method does not alwasy work properly
		
		form: null,						// default operation form
		
		getLatestBy: 'id',				// defines what field models' manager method
										// getLatest will look at
		
		handler404: 'broke.views.pageNotFound',
		
		//hideHash: false,				// whether you want the hash to be hidden
										// from the main url
										// careful: hideHash and preventDefault are equivalent!!
										// just use preventDefault for now
		installedApps: [],				// list of installed apps
		jsonUrls: {
			'getData': '/%(appLabel)s/%(model)s/json/get_data/',
			'save': '/%(appLabel)s/%(model)s/json/save/',
			'delete': '/%(appLabel)s/%(model)s/json/delete/'
		},
		
		// locale specific settings
		localePaths: [],
		languageCode: 'en',
		languages: {
			'en': 'English',
			'it': 'Italian'
		},
		languageCookieName: 'broke_language',
		
		middleware: [
			'broke.middleware.CommonMiddleware'
		],
		
		preventDefault: false,			// whether you want the broke.response to
										// prevent default action from the browser
										// careful: hideHash and preventDefault are equivalent!!
		
		queryType: 'local',				// local|remote
										// wether you want your query to hit a local database,
										// populated with previously fetched data,
										// or query the remote database
		
		'return': window.location.href,	// form return url
		
		stopPropagation: false,			// whether you want the broke.response to
										// prevent event propagation
		
		save: {							// save settings
			commit: true				// if you want to prevent the object to
										// be saved right away, you should set this
										// to false and then explicitly call the
										// save method on the object with commit= true
										// e.g.: entry.save({commit: true})
		},
		templateStringIfInvalid: '',
		templateDirs: [],
		templateLoaders: [
			'broke.template.loaders.projects'
		],
		
		// list of elements that trigger the
		// broke.request event, setting the url
		// WARNING: will only work if 'eventTriggeringMethod' is set to 'elements'
		urlChangingElements: {
			'a': {
				events: ['click'],		// events
				urlAttribute: 'href'	// attribute holding the url
			},
			'form': {
				events: ['submit'],
				urlAttribute: 'action',
				preventDefault: true
			},
			// you may attach the jQ request event to different elements
			// for instance you could do that:
			'div[data-href]': {
				events: ['div'],
				urlAttribute: 'data-href'	// html5 "data-" attribute
			},
			// or even
			'*[data-href]': {
				events: ['click'],
				urlAttribute: 'data-href'
			}
		},
		useAjax: true,					// would you like to use ajax?
										// if false, it will create a form and
										// send your date through that form
										// WARNING: not ready yet!
		usei18n: false
	}
});
