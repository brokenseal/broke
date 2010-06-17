(function(__global__){
	var
		gettext_test= myProject.apps.gettext_test,
		gettextLazy= require('broke/utils/translation').gettext.gettextLazy,
		create= require('broke/shortcuts').node.create,
		messageList= [
			gettextLazy('First try'),
			gettextLazy('Second try'),
			gettextLazy('Third try')
		]
	;
	
	// views
	gettext_test.views= {
		view: function(request, args){
			var
				message= messageList[args[0].asInt()],
				content= $('#content')
			;
			
			content.empty();
			
			return create({
				htmlNode: content,
				template: 'message_view.html',
				context: {
					message: message
				}
			});
		},
		setLanguage: function(request){
			var
				next= request.REQUEST['next'] || null,
				response= {},
				settings= broke.conf.settings,
				langCode,
				checkForLanguage
			;
			
			if(!next) {
				next= request.META['HTTP_REFERER'];
			}
			if(!next) {
				next= '';
			}
			
			langCode= request.REQUEST['language'] || null;
			
//			if(langCode && checkForLanguage(langCode)) {
			if(true) {
				if('session' in request) {
					// still not sure how to handle this
					// TODO
					request.session.brokeLanguage= langCode;
				} else if('cookie' in request) {
					// still not sure how to handle this
					// TODO
					//request.cookie= [settings.LANGUAGE_COOKIE_NAME, langCode];
				} else {
					window.location.href= window.location.href.split('#')[0].split('?')[0] + '?language=' + langCode;
				}
			}
			
			//broke.request(next);
			return {};
		}
	};
	
	// urls
	gettext_test.urlPatterns= [
		['set_language/$', gettext_test.views.setLanguage, 'set_language'],
		['view/(.*)/$', gettext_test.views.view, 'view']
	];
})(this);
