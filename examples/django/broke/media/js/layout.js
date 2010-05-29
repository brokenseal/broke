$(function(){
	$('body').layout({
        defaults: {
            spacing_open: 4,
            spacing_closed: 14,
            togglerLength_closed: "100%",
            initClosed: false,
            resizerTip: "Resize",
            enableCursorHotkey: true,
            fxName: "slide",
            fxSpeed: "slow"
        },
        east: {
			size: 240,
			minSize: 240,
			maxSize: 330
		},
        north: {
            closable: false,
            resizable: false,
            spacing_open: 0,
            size: 170
        },
        west: {
			size: 260,
			minSize: 230,
			maxSize: 480
		}
    });
    /*
	$('.ui-layout-east input[name="pub_date"]').datepicker({
		dateFormat: broke.conf.settings.DATE_FORMAT
	});
	*/
	$('.menu a, form button, .toolbar a').button();
});

$(window).bind('broke.ready', function(){
	$('#overlay').fadeOut();
});
