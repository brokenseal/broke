/****************************************************************************/
/***************************** LOCALE METHODS *******************************/
/****************************************************************************/


// still not sure how to manage this...
(function(){
	broke.extend(broke.locale, {
		gettext: (function(){
			var localeObject= {};
			
			return {
				setLocaleString: function(string){
					localeObject[string]= string;
				},
				getLocaleString: function(string){
					localeObject[string];
				}
			}
		})()
	});
})();
