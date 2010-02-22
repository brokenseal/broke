(function(){
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
			ngettext: gettext.ngettext
		}
	});
})();
