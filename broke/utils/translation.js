(function(__global__){
	var __module__= broke.utils.translation,
		lazy= broke.utils.functional.lazy,
		settings= broke.conf.settings;
	
	broke.utils.translation= {
		init: function(args) {
			domain= 'broke';
			url= args.url;
			
			if(url) {
				gettext.tryLoadLangPo(url);
			} else {
				gettext.tryLoadLang();
			}
		},
		getLanguage: function(){
			// not sure about this...
			// TODO: fix
			return settings.LANGUAGE_CODE;
		},
		gettext: gettext.gettext,
		ngettext: gettext.ngettext,
		gettextLazy: lazy(gettext.gettext),
		ngettextLazy: lazy(gettext.ngettext)
	};
	
	return __module__;
})(this);
