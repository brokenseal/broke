(function(){
	var gettext_test= myProject.apps.gettext_test,
		language= window.location.href.split('?switch_lang=')[1] || 'it',
		gt= new broke.i18n.Gettext({
			domain: 'broke',
			url: 'http://demo_media.brokenseal.it/js/myProject/locale/' + language + '/LC_MESSAGES/djangojs.po'
		}),
		messageList= [
			gt.gettext('First try'),
			gt.gettext('Second try'),
			gt.gettext('Third try')
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
				template: gettext_test.templates.messageView,
				context: {
					message: message
				}
			};
		},
		changeLang: function(request, args){
			var language= args[0],
				gt= new broke.i18n.Gettext({
					domain: 'broke',
					url: 'http://demo_media.brokenseal.it/js/myProject/locale/' + language + '/LC_MESSAGES/djangojs.po'
				});
			
			return {};
		}
	};
	
	// urls
	gettext_test.urlPatterns= [
		['^/gettext_test/', [
			['change_lang/(.*)/$', gettext_test.views.changeLang, 'change_lang'],
			['view/(.*)/$', gettext_test.views.view, 'view']
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
