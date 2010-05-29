(function(__global__){
	var
		gettext_test= myProject.apps.gettext_test,
		gettextLazy= require('broke/utils/translation').gettextLazy,
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
		setLanguage: function(request, args){
			// TODO
		}
	};
	
	// urls
	gettext_test.urlPatterns= [
		['set_language/$', gettext_test.views.setLanguage, 'set_language'],
		['view/(.*)/$', gettext_test.views.view, 'view']
	];
})(this);
