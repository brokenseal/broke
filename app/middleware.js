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
				if(broke.settings.hideHash || broke.settings.preventDefault) {
					request.event.preventDefault();
				}
				
				// stop propagation
				if(broke.settings.stopPropagation) {
					request.event.stopPropagation();
				}
				
				return this;
			}
		},
		AddressBarMiddleware: {
			processRequest: function(request){
				if(broke.settings.debug) {
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
							
							$(window).trigger('broke.request', [{
								url: $(this).find('input').val(),
								event: e
							}]);
						});
					}
					addressBar.find('input').val(request.url);
					
					if(broke.settings.addressBar.hide === true) {
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
