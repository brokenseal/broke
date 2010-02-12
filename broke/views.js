/*************************************************************************/
/******************************* VIEWS ***********************************/
/*************************************************************************/

(function(){
	broke.views= {
		pageNotFound: function(request){
			// no matching url found, fail silently...
			broke.log(gettext("No matching url found, fail silently..."));
		}
	};
})();
