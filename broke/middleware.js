 /*
  * A middleware should implement at least one of this two methods:
  * - processRequest
  * - processResponse
  * 
  */

/************************* DEFAULT MIDDLEWARE ****************************/
(function(){
	broke.extend(broke.middleware, {
		CommonMiddleware: {
			processResponse: function(request){
				// hide hash
				if(broke.conf.settings.HIDE_HASH || broke.conf.settings.PREVENT_DEFAULT) {
					request.event.preventDefault();
				}
				
				// stop propagation
				if(broke.conf.settings.STOP_PROPAGATION) {
					request.event.stopPropagation();
				}
				
				return this;
			}
		},
		AddressBarMiddleware: {
			processResponse: function(response){
				if(broke.conf.settings.DEBUG) {
					var addressBar= $('#address_bar');
					
					// first time
					if(!addressBar.length) {
						addressBar= $(broke.templates.addressBar).appendTo($('body'));
						
						addressBar.find('a').click(function(e){
							e.preventDefault();
							addressBar.slideUp();
						});
						
						addressBar.find('form').submit(function(e){
							e.preventDefault();
							
							broke.request({
								url: $(this).find('input').val(),
								event: e
							});
						});
					}
					addressBar.find('input').val(response.url);
					
					if(broke.conf.settings.ADDRESS_BAR.hide === true) {
						addressBar.slideDown(500, function(){
							setTimeout(function(){
								addressBar.slideUp();
							}, 2000);
						});
					}
					else if(addressBar.is(':hidden')) {
						addressBar.slideDown(1200);
					}
				}
				return this;
			}
		}
	});
})();
