(function(){
	var gettext_test= myProject.apps.gettext_test,
		gettextLazy= broke.utils.translation.gettextLazy,
		create= broke.shortcuts.node.create,
		messageList= [
			gettextLazy('First try'),
			gettextLazy('Second try'),
			gettextLazy('Third try')
		];
	
	// views
	gettext_test.views= {
		view: function(request, args){
			var message= messageList[args[0].asInt()],
				content= $('#content');
			
			content.empty();
			
			
			return create({
				htmlNode: content,
				template: 'message_view.html',
				context: {
					message: message
				}
			});
		}
	};
	
	// urls
	gettext_test.urlPatterns= [
		['set_language/$', broke.views.setLanguage, 'set_language'],
		['view/(.*)/$', gettext_test.views.view, 'view']
	];
})();
