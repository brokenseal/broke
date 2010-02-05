/****************************************************************************/
/***************************** LOCALE METHODS *******************************/
/****************************************************************************/

// still not sure how to manage this...
// alpha testing
(function(){
	broke.extend(broke.i18n, {
		// a really personal and simplistic implementation of the GNU translation system
		GNUTranslations: (function(){
			var domains= {},
				c= 0,
				defaultDomain= {};
			
			return {
				textdomain: function(dom, localeDir){
					if(!dom) {
						return defaultDomain;
					}
					
					// TODO: find a better way
					$.ajax({
						async: false,
						url: localeDir + dom + '.po',
						success: function(data, status){
							// transform the po file in well formatted JSON
							//data= po2json(data);
							
							domains[dom]= data;
						}
					});
					
					return domains[dom];
				},
				gettext: function(message){
					if(message in translatedText) {
						return translatedText[message] || message;
					}
					
					return message;
				},
				ngettext: function(singular, plural, n){
					var message= n === 1 ? singular : plural;
					
					if(message in translatedText) {
						return translatedText[message] || message;
					}
					
					return message;
				}
			};
		})()
	});
})();
