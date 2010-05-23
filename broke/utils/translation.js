(function(__global__){
	var
		__module__= {},
		lazy= broke.utils.functional.lazy,
		settings= broke.conf.settings
	;
	
	__module__= {
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
	
	broke.utils.translation= __module__;
	return __module__;
})(this);
