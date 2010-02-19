/*************************************************************************/
/******************************* VIEWS ***********************************/
/*************************************************************************/

(function(){
	var gettext= broke.i18n.gettext;
	
	broke.views= {
		pageNotFound: function(request){
			// no matching url found, fail silently...
			broke.log(gettext("No matching url found, fail silently..."));
		}
	};
})();
