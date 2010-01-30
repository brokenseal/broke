/****************************************************************************/
/******************************* SETTINGS ***********************************/
/****************************************************************************/

broke.extend({
	settings: {
		// it determines the way to trigger the broke.request event
		// choices are: elements, hashchange
		// WARNING: hashChange will work with an interval of 150ms on old browsers
		// on more recent browsers will make use of the 'onhashchange' event
		// which, by the time of the writing, it is only available on Firefox 3.6 and IE8
		// as for the 'elements' method please refer to the documentation under the
		// 'events' topic
		eventTriggeringMethod: 'elements',
		
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
		handler404: 'broke.views.pageNotFound',
		middleware: [
			'broke.middleware.CommonMiddleware'
		],
		contextProcessors: [
			'broke.contextProcessors.debug'
		],
		queryType: 'local',				// local|remote
										// wether you want your query to hit a local database,
										// populated with previously fetched data,
										// or query the remote database
		jsonUrls: {
			'getData': '/{{ appLabel }}/{{ model }}/json/get_data/',
			'save': '/{{ appLabel }}/{{ model }}/json/save/',
			'delete': '/{{ appLabel }}/{{ model }}/json/delete/'
		},
		installedApps: [],				// list of installed apps
		form: null,						// default operation form
		useAjax: true,					// would you like to use ajax?
		ajax: {							// ajax settings
			dataType: 'json',			// ajax data type which returns from the server
			async: false
		},
		save: {							// save settings
			commit: true				// if you want to prevent the object to
										// be saved right away, you should set this
										// to false and then explicitly call the
										// save method on the object with commit= true
										// e.g.: entry.save({commit: true})
		},
		dateFormat: 'yy-mm-dd',			// used pretty much everywhere
		language: 'en',
		debug: false,					// debug setting
		
		//hideHash: false,				// whether you want the hash to be hidden
										// from the main url
										// careful: hideHash and preventDefault are equivalent!!
										// just use preventDefault for now
		
		preventDefault: false,			// whether you want the broke.response to
										// prevent default action from the browser
										// careful: hideHash and preventDefault are equivalent!!
										
		stopPropagation: false,			// whether you want the broke.response to
										// prevent event propagation
		
		eventBinding: 'live',			// bind|live
										// it should always be set to 'live' but
										// at the current stage jQuery's live
										// method is buggy
		
		'return': window.location.href,	// form return url
		getLatestBy: 'id'				// defines what field models' manager method
										// getLatest will look at
	}
});
