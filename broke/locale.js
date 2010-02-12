broke.extend(broke.settings.locale, {
	'en': {
		dateFormat: 'MM-dd-yyyy',
		dateTimeFormat: 'MM-dd-yyyy HH:MM'
	},
	'it': {
		dateFormat: 'dd-MM-yyyy',
		dateTimeFormat: 'dd-MM-yyyy HH:MM'
	}
}[broke.settings.language]);
