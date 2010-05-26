(function(_){
	var
		lazy= require('broke/utils/functional').lazy,
		settings= require('broke/conf/settings'),
		gettext= require('dependencies/gettext')
	;
	
	_.init= function(args) {
		domain= 'broke';
		url= args.url;
		
		if(url) {
			gettext.tryLoadLangPo(url);
		} else {
			gettext.tryLoadLang();
		}
	};
	
	_.getLanguage= function(){
		// not sure about this...
		// TODO: fix
		return settings.LANGUAGE_CODE;
	};
	
	_.gettext= gettext.gettext;
	_.ngettext= gettext.ngettext;
	_.gettextLazy= lazy(gettext.gettext);
	_.ngettextLazy: lazy(gettext.ngettext);
	
})(exports);
