(function(_){
	var
		__module__= {},
		extend= require('broke/core/utils').extend
	;
	
	__module__= {
		common: {
			CommonMiddleware: {
				processResponse: function(request){
			        // Check for denied User-Agents
					// DISALLOWED_USER_AGENTS
					
					// Check for a redirect based on settings.APPEND_SLASH
					// and settings.PREPEND_WWW
					
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
						var addressBar= $('#address_bar'),
							ADDRESS_BAR_TEMPLATE= 	'<div id="address_bar" style="position:fixed;'+
															'top:-10px;'+
															'right:20px;'+
															'border:1px solid red;'+
															'border-top:0;'+
															'padding:20px;'+
															'background:#ff7209;'+
															'display:none;'+
															'z-index:999;'+
															'-moz-border-radius:10px;>'+
														'<a href="#" style="position:absolute;top:10px;right:20px;">[Hide]</a>'+
														'<form action="." method="post" style="padding:0;">'+
															'<p>'+
																'<label for="url">Url: </label>'+
																'<input type="text" name="url" size="60" value=""/>'+
															'</p>'+
														'</form>'+
													'</div>';
						
						// first time
						if(!addressBar.length) {
							addressBar= $(ADDRESS_BAR_TEMPLATE).appendTo($('body'));
							
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
		}
	};
	
	extend(_, __module__);
})(exports);
