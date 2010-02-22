(function(){
	var gettext_test= myProject.apps.gettext_test,
		gettext= broke.utils.translation.gettext,
		create= broke.shortcuts.node.create;
	
	// views
	gettext_test.views= {
		view: function(request, args){
			var messageList= messageList= [
					gettext('First try'),
					gettext('Second try'),
					gettext('Third try')
				],
				message= messageList[args[0].asInt()],
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
