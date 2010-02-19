broke.extend(broke.conf.settings.LOCALE, {
	'en': {
		dateFormat: 'MM-dd-yyyy',
		dateTimeFormat: 'MM-dd-yyyy HH:MM'
	},
	'it': {
		dateFormat: 'dd-MM-yyyy',
		dateTimeFormat: 'dd-MM-yyyy HH:MM'
	}
}[broke.conf.settings.LANGUAGE_CODE]);
