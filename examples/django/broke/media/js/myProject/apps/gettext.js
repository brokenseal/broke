(function(){
	var gettext_test= myProject.apps.gettext_test,
		gettext= broke.i18n.gettext,
		create= broke.shortcuts.node.create;
	
	// views
	gettext_test.views= {
		view: function(request, args){
			var messageList= [
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
		},
		changeLang: function(request, args){
			return {};
		}
	};
	
	// urls
	gettext_test.urlPatterns= [
		['change_lang/(.*)/$', gettext_test.views.changeLang, 'change_lang'],
		['view/(.*)/$', gettext_test.views.view, 'view']
	];
})();
