/****************************************************************************/
/*************************** CONTEXT PROCESSORS *****************************/
/****************************************************************************/

/*
 * 
 * 
 * 
 */

broke.extend({
	contextProcessors: {
		debug: function(request){
			return {
				'debug': broke.settings.debug
			};
		},
		i18n: function(request){
			return {
				'languageCode': broke.settings.languageCode,
				'languages': keys(broke.settings.languages)
			};
		}
	}
});
