(function(){
	var gt= new broke.i18n.Gettext({
			domain: 'djangojs'
		}),
		gettext= gt.gettext,
		messageList= [
			gettext('First try'),
			gettext('Second try'),
			gettext('Third try')
		];
	
	// views
	gettext_test.views= {
		view: function(request, args){
			var message= messageList[args[0].asInt()],
				content= $('#content');
			
			content.empty();
			
			return {
				operation: 'create',
				htmlNode: content,
				template: gettext_templates.messageView,
				context: message
			};
		}
	};
	
	// urls
	gettext_test.urlPatterns= [
		['^/gettext_test/', [
			['view/(.*)$', gettext_test.views.view, 'view']
		], 'gettext_test']
	];
	broke.extend(broke.urlPatterns, gettext_test.urlPatterns);
	
	// templates
	gettext_test.templates= {
		messageView:	'<div>\
							{{ message }}\
						</div>'
	};
})();

broke.extend(broke.settings, {
	usei18n:true
});
