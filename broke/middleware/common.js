(function(_){
	var 
		settings= require('broke/conf/settings').settings
		,GenericError= require('broke/core/exceptions').GenericError
		,gettext= require('broke/utils/translation').gettext.gettext
		,http= require('broke/http/http')
		,exceptions= require('broke/core/exceptions')
		,urlResolvers= require('broke/core/urlresolvers')
		,urlquote= require('broke/utils/http').urlquote
		//,mailManagers= request('broke/core/mail').mailManagers
		,md5Constructor= require('dependencies/md5').hex_md5
		
		,utils= require('broke/core/utils')
		,Class= require('dependencies/pyjammin/class').Class
		,_isValidPath= function(path, urlConf){
			// Returns True if the given path resolves against the default URL resolver,
			// False otherwise.
			try {
				urlResolvers.resolve(path, urlConf);
				return true;
			} catch(e) {
				if(e.name == urlResolvers.Resolver404) {
					return false;
				}
			}
		}
	;
	
	/*    "Common" middleware for taking care of some basic operations:
	
	        - Forbids access to User-Agents in settings.DISALLOWED_USER_AGENTS
	
	        - URL rewriting: Based on the APPEND_SLASH and PREPEND_WWW settings,
	          this middleware appends missing slashes and/or prepends missing
	          "www."s.
	
	            - If APPEND_SLASH is set and the initial URL doesn't end with a
	              slash, and it is not found in urlpatterns, a new URL is formed by
	              appending a slash at the end. If this new URL is found in
	              urlpatterns, then an HTTP-redirect is returned to this new URL;
	              otherwise the initial URL is processed as usual.
	
	        - ETags: If the USE_ETAGS setting is set, ETags will be calculated from
	          the entire page content and Not Modified responses will be returned
	          appropriately.
	*/
	Class.create({
		__name__: 'CommonMiddleware'
		,__parent__: _
		,processRequest: function(request){
			// Check for denied User-Agents and rewrite the URL based on
			// settings.APPEND_SLASH and settings.PREPEND_WWW
			var
				i
				,len
				,host
				,oldUrl
				,newUrl
				,urlConf
			;
			
			if(request.META && request.META.HTTP_USER_AGENT !== undefined) {
				for(i= 0; settings.DISALLOWED_USER_AGENTS < len;  i++){
					if(settings.DISALLOWED_USER_AGENTS[i].test(request.META.HTTP_USER_AGENT)) {
						return http.HttpResponseForbidden('<h1>Forbidden</h1>');
					}
				}
			}
			
			// Check for a redirect based on settings.APPEND_SLASH
			// and settings.PREPEND_WWW
			host = request.getHost();
			
			oldUrl= [ host, request.path ];
			newUrl= [].concat(oldUrl);
			
			if(settings.PREPEND_WWW != false && oldUrl[0] && !utils.startsWith(newUrl[0], 'www.')){
				newUrl[0] = 'www.' + oldUrl[0];
			}
			
			// Append a slash if APPEND_SLASH is set and the URL doesn't have a
			// trailing slash and there is no pattern for the current path
			if(settings.APPEND_SLASH && !utils.endsWith(oldUrl[0]), '/'){
				urlConf= request.urlConf || null;
				
				if(!_isValidPath(request.pathInfo, urlConf) && _isValidPath(utils.interpolate('%s/', request.pathInfo), urlConf)){
					newUrl[1]= newUrl[1] + '/';
					
					if(settings.DEBUG && request.method == 'POST'){
						throw exceptions.RuntimeError(utils.interpolate("You called this URL via POST, but the URL doesn't end "+
							"in a slash and you have APPEND_SLASH set. Broke can't "+
							"redirect to the slash URL while maintaining POST data. "+
							"Change your form to point to %s%s (note the trailing "+
							"slash), or set APPEND_SLASH=False in your Broke "+
							"settings.", newUrl[0], newUrl[1]));
					}
				}
			}
			
			if(utils.eq(newUrl, oldUrl)){
				return;
			}
			
			if(newUrl[0]) {
				newUrl = utils.interpolate("%s://%s%s", [ (request.isSecure()?'https':'http'), newUrl[0], urlquote(newUrl[1]) ]);
			} else {
				newUrl= urlquote(newUrl[1]);
			}
			
			if(utils.len(request.GET)) {
				newUrl+= '?' + request.META.QUERY_STRING;
			}
			
			return http.HttpResponsePermanentRedirect(newUrl);
		}
		,processResponse: function(request, response){
			var
				domain
				,referer
				,isInternal
				,path
				,ua
				,ip
				,etag
				,cookies
			;
			// Check for a flat page (for 404s) and calculate the Etag, if needed."
			if(response.statusCode == 404) {
				if(settings.SEND_BROKEN_LINK_EMAILS) {
					// If the referrer was from an internal link or a non-search-engine site,
					// send a note to the managers.
					domain= request.getHost();
					referer= request.META.HTTP_REFERER || null;
					isInternal= _isInternalRequest(domain, referer);
					path= request.getFullPath();
					
					if(referer && !_isIgnorable404(path) && referer[(isInternal || '?')] === undefined) {
						ua= request.META.HTT_USER_AGENT || '<none>';
						ip= request.META.REMOTE_ADDR || '<none>';
						mailManagers(
							utils.interpolate("Broken %slink on %s", [(isInternal ? 'INTERNAL ' : ''), domain ]),
							utils.interpolate("Referrer: %s\nRequested URL: %s\nUser agent: %s\nIP address: %s\n", [ referer, request.getFullPath(), ua, ip ])
						);
					}
					
					return response;
				}
			}
			// Use ETags, if requested.
			if(settings.USE_ETAGS) {
				if(response.hasHeader('ETag')) {
					etag= response.getHeader('ETag');
				} else {
					utils.interpolate('"%s"', [ md5Contructor(response.content) ]);
				}
				
				if(response.statusCode >= 200 && response.statusCode < 300 && request.META.HTTP_IF_NONE_MATCH == etag) {
					cookies= response.cookies;
					response= http.HttpResponseNotModified();
					response.cookies= cookies;
				} else {
					response.setHeader('ETag', etag);
				}
			}
			
			return response
		}
	});
	
	/*
	__module__= {
		AddressBarMiddleware: {
			processResponse: function(response){
				if(settings.DEBUG) {
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
							
							request({
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
	};
	*/
})(exports);
