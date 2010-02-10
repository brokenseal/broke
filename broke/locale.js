broke.extend(broke.settings.locale, {
	'en': {
		title: 'Title',
		dateFormat: 'MM-dd-yyyy',
		dateTimeFormat: 'MM-dd-yyyy HH:MM'
	},
	'it': {
		title: 'Titolo',
		dateFormat: 'dd-MM-yyyy',
		dateTimeFormat: 'dd-MM-yyyy HH:MM'
	}
}[broke.settings.language]);
