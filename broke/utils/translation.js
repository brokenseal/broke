(function(){
	var lazy = broke.utils.functional.lazy;
	
	broke.extend(broke.utils, {
		translation: {
			init: function(args) {
				domain= 'broke';
				url= args.url;
				
				if(url) {
					gettext.tryLoadLangPo(url);
				} else {
					gettext.tryLoadLang();
				}
			},
			gettext: gettext.gettext,
			ngettext: gettext.ngettext,
			gettextLazy: lazy(gettext.gettext),
			ngettextLazy: lazy(gettext.ngettext)
		}
	});
})();
