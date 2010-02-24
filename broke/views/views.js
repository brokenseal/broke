/*************************************************************************/
/******************************* VIEWS ***********************************/
/*************************************************************************/

(function(){
	var gettext= broke.utils.translation.gettext;
	
	broke.extend({
		views: {
			defaults: {
				setLanguage: function(request){
					var next= request.REQUEST['next'] || null,
						response= {},
						settings= broke.conf.settings,
						langCode,
						checkForLanguage;
					
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
				},
				pageNotFound: function(request){
					// no matching url found, fail silently...
					broke.log(gettext("No matching url found, fail silently..."));
				}
			}
		}
	});
})();
