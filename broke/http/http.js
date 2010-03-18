(function(__global__){
	var __module__ = broke.http = {},
		Class= broke.Class,
		// TODO
		MultiValueDict= broke.utils.dataStructures.MultiValueDict,
		// TODO
		ImmutableList= broke.utils.dataStructures.ImmutableList,
		// TODO
		BaseCookie= SimpleCookie= CookieError= {},
		settings= broke.conf.settings,
		absoluteHttpUrlRe= new RegExp("^https?://", "i"),
		RESERVED_CHARS= "!*'();:@&=+$,/?%#[]",
		parseCookie;
	
	__module__= {
		Http404: function(message){
			return {
				name: "Http404",
				message: message
			};
		},
		parseCookie: function(cookie){
			var c,
				cookieDict= {};
			
			if(cookie == "") {
				return {};
			}
			
			if(!(cookie instanceof broke.http.BaseCookie)) {
				try {
					c= new CompatCookie();
					c.load(cookie);
				} catch(e){
					if(e.name == "CookieError") {
						//invalid cookie
						return {};
					}
				}
			} else {
				c= cookie;
			}
			
			forEach(c, function(key){
				cookieDict[key]= c[key];
			});
			
			return cookieDict;
		}
	};
	
	Class.extend("broke.http.HttpRequest", {
		_encoding: null,
		_uploadHandlers: [],
		init: function(){
			this.GET = {};
			this.POST = {};
			this.COOKIES = {};
			this.META = {};
			this.FILES = {};
			
			this.path= '';
			this.pathInfo= '';
			this.method= null;
		},
		getHost: function(){
			// Returns the HTTP host using the environment or request headers.
			// We try three options, in order of decreasing preference.
			var host,
				serverPort;
			
			if('HTTP_X_FORWARDED_HOST' in this.META) {
				host= this.META.HTTP_X_FORWARDED_HOST;
			} else if('HTTP_HOST' in this.META) {
				host= this.META.HTTP_HOST;
			} else {
				// Reconstruct the host using the algorithm from PEP 333.
				host= this.META.SERVER_NAME;
				serverPort= this.META.SERVER_PORT;
				
				if(serverPort != (this.isSecure() ? '443' : '80')) {
					host= '%s:%s'.echo(host, serverPort);
				}
			}
			
			return host;
		},
		getFullPath: function(){
			return '';
		},
		buildAbsoluteUri: function(location){
			/*
				Builds an absolute URI from the location and the variables available in
				this request. If no location is specified, the absolute URI is built on
				``request.getFullPath()``.
			*/
			var currentUri;
			
			if(location === undefined) {
				location= this.getFullPath();
			}
			if(!(location.match(absoluteHttpUrlRe))) {
				currentUri='%s://%s%s'.echo((this.isSecure() ? 'https' : 'http'), this.getHost(), this.path);
				location= urlJoin(currentUri, location);
			}
			return iriToUri(location);
		},
		isSecure: function(){
			// TODO
			//return os.environ.get("HTTPS") == "on"
			return false;
		},
		isAjax: function(){
			return this.META['HTTP_X_REQUESTED_WITH'] == 'XMLHttpRequest';
		},
		setEncoding: function(val){
			/*
				Sets the encoding used for GET/POST accesses. If the GET or POST
				dictionary has already been created, it is removed and recreated on the
				next access (so that it is decoded correctly).
			*/
			this._encoding= val;
			if('_get' in this) {
				delete this._get;
			}
			if('_set' in this) {
				delete this._set;
			}
		},
		getEncoding: function(){
			return this.encoding;
		},
		encoding: null,	// property(_get_encoding, _set_encoding)
		_initializeHandlers: function(){
			var _this= this;
			
			this._uploadHandlers= map(settings.FILE_UPLOAD_HANDLERS, function(){
				uploadhandler.loadHandler(this, _this);
			});
		},
		_setUploadHandlers: function(_uploadHandlers){
			if('_files' in this) {
				throw AttributeError(gettextLazy("You cannot set the upload handlers after the upload has been processed."));
			}
			this._uploadHandlers= _uploadHandlers;
		},
		_getUploadHanlders: function(){
			if(!this._uploadHandlers.length) {
				this._initializeHandlers();
			}
			
			return this._uploadHandlers();
		},
		upload_handlers: [],	// property(_get_upload_handlers, _set_upload_handlers)
		parseFileUpload: function(META, postData){
			// Returns an array of (POST QueryDict, FILES MultiValueDict).
			var parser;
			
			this.uploadHandlers = ImmutableList(self.upload_handlers, warning = gettextLazy("You cannot alter upload handlers "+
																								"after the upload has been processed."));
			parser= MultiPartParser(META, postData, this.uploadHandlers, this.encoding);
			return parser.parse();
		},
		toString: function(){
			return '<HttpRequest\nGET:%s,\nPOST:%s,\nCOOKIES:%s,\nMETA:%s>'.echo(this.GET, this.POST, this.COOKIES, this.META);
		}
	});
	
	Class.extend("broke.http.HttpResponse", {
		// A basic HTTP response, with content and dictionary-accessed headers.
		statusCode: 200,
		init: function(content, mimeType, status){
		},
		toString: function(){
			return '<HttpRequest\nGET:%s,\nPOST:%s,\nCOOKIES:%s,\nMETA:%s>'.echo(this.GET, this.POST, this.COOKIES, this.META);
		},
		_convertToAscii: function(arr){},
		set: function(header, value){},
		get: function(header){},
		del: function(header){},
		hasHeader: function(header){},
		items: function(){},
		_convertToAscii: function(){},
		_convertToAscii: function(){},
	});
	
	MultiValueDict.extend("broke.http.QueryDict", {
		init: function(){
			// TODO
		}
	});
	
	CompatCookie.extend("broke.http.SimpleCookie", {
		init: function(){
			this._super();
		},
		valueEncode: function(){
			/*
				Some browsers do not support quoted-string from RFC 2109,
				including some versions of Safari and Internet Explorer.
				These browsers split on ';', and some versions of Safari
				are known to split on ', '. Therefore, we encode ';' and ','
				
				SimpleCookie already does the hard work of encoding and decoding.
				It uses octal sequences like '\\012' for newline etc.
				and non-ASCII chars.  We just make use of this mechanism, to
				avoid introducing two encoding schemes which would be confusing
				and especially awkward for javascript.
				
				NB, contrary to Python docs, valueEncode returns a tuple containing
				(real val, encoded_val)
			*/
			var superResult= this._super(val);
				val= superResult[0],
				encoded= superResult[1];
			
			encoded = encoded.replace(";", "\\073").replace(",","\\054");
			
			// If encoded now contains any quoted chars, we need double quotes
			// around the whole string.
			if(encoded.indexOf('\\') > 0 && !encoded.startsWith('"')) {
				encoded = '"' + encoded + '"'
			}
			
			return [val, encoded];
		}
	});

	return __module__;
//})(this);
});
