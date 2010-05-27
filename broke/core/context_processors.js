(function(_){
	_.debug= function(request){
		return {
			'debug': broke.conf.settings.DEBUG
		};
	};
	_.i18n= function(request){
		return {
			'languageCode': broke.conf.settings.LANGUAGE_CODE,
			'languages': keys(broke.conf.settings.LANGUAGES)
		};
	}
})(exports);
