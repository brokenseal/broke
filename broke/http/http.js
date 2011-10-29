(function(_){
	var
		__module__,
		utils= require('broke/core/utils'),
		Exception= require('broke/core/exceptions').Exception,
		Class= require('dependencies/pyjammin/class').Class,
		HttpRequest,
		HttpResponse,

		// TODO
//		MultiValueDict= broke.utils.dataStructures.MultiValueDict,
		// TODO
//		ImmutableList= broke.utils.dataStructures.ImmutableList,
		// TODO
//		BaseCookie= SimpleCookie= CookieError= {},

		iriToUri= require('broke/utils/encoding').iriToUri,
		exceptions= require('broke/core/exceptions'),
		ValueError= exceptions.ValueError,
		settings= require('broke/conf/settings').settings,
		absoluteHttpUrlRe= new RegExp("^https?://", "i"),
		RESERVED_CHARS= "!*'();:@&=+$,/?%#[]",
		parseCookie
	;

	Exception.create({
		__name__: 'Http404'
		,__parent__: _
		,__init__: function(message){
			this._super(message);
		}
	});

	Exception.create({
		__name__: 'BadHeaderError'
		,__parent__: _
		,__init__: function(message){
			this._super(message);
		}
	});

	_.parseCookie= function(cookie){
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

		utils.forEach(c, function(key){
			cookieDict[key]= c[key];
		});

		return cookieDict;
	};

	// A backwards compatible alias for HttpRequest.get_host.
	_.getHost= function(request){
		return request.getHost();
	};

	Class.create({
		__name__: 'HttpRequest'
		,__parent__: _
		,_encoding: null
		,_uploadHandlers: []
		,__init__: function(data){
			this.GET = {};
			this.POST = {};
			this.COOKIES = {};
			this.META = {};
			this.FILES = {};

			this.path= '';
			this.pathInfo= '';
			this.method= null;
		},
		__str__: function(){
			return utils.interpolate('<HttpRequest\nGET:%s,\nPOST:%s,\nCOOKIES:%s,\nMETA:%s>', [this.GET, this.POST, this.COOKIES, this.META]);
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
					host= utils.interpolate('%s:%s', [host, serverPort]);
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
				currentUri= utils.interpolate('%s://%s%s', [(this.isSecure() ? 'https' : 'http'), this.getHost(), this.path]);
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

			this._uploadHandlers= utils.map(settings.FILE_UPLOAD_HANDLERS, function(){
				uploadhandler.loadHandler(this, _this);
			});
		},
		_setUploadHandlers: function(_uploadHandlers){
			if('_files' in this) {
				throw new AttributeError(gettextLazy("You cannot set the upload handlers after the upload has been processed."));
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
		}
	});

//	MultiValueDict.create("broke.http.QueryDict", {
//		init: function(){
			// TODO
//		}
//	});

//	CompatCookie.create("broke.http.SimpleCookie", {
//		init: function(){
//			this._super();
//		},
//		valueEncode: function(){
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
//			var superResult= this._super(val);
//				val= superResult[0],
//				encoded= superResult[1];

//			encoded = encoded.replace(";", "\\073").replace(",","\\054");

			// If encoded now contains any quoted chars, we need double quotes
			// around the whole string.
//			if(encoded.indexOf('\\') > 0 && !utils.startsWith(encoded, '"')) {
//				encoded = '"' + encoded + '"'
//			}

//			return [val, encoded];
//		}
//	});


	Class.create({
		__name__: 'HttpResponse'
		,__parent__: _
		// A basic HTTP response, with content and dictionary-accessed headers.
		,statusCode: 200
		,__init__: function(content, mimeType, status, contentType){
			var
				contentType
			;

			this._charset= settings.DEFAULT_CHARSET;
			if(mimeType) {
				contentType= mimeType; // For backwards compatibility
			}

			if(!contentType) {
				contentType= utils.interpolate("%s; charset=%s", [settings.DEFAULT_CONTENT_TYPE, settings.DEFAULT_CHARSET]);
			}

			// TODO: not sure about this condition...
			if(!(utils.typeOf(content) == "string") && utils.typeOf(content) == "array") {
				this._container= content;
				this._isString= false;
			} else {
				this._container= [content];
				this._isString= true;
			}

			//this.cookies= new CompatCookie();

			if(status) {
				this.statusCode= status;
			}
			// _headers is a mapping of the lower-case name to the original case of
			// the header (required for working with legacy systems) and the header
			// value.
			this._headers = {
				'content-type': ['Content-Type', contentType]
			};
		},
		__str__: function(){
			// Full HTTP message, including headers.
			var result= [];

			utils.forEach(this._headers, function(key){
				result.push(utils.interpolate("%s: %s\n", [key, this]));
			});
			result.push("\
						\
						" + this.getContent());

			return result.join('');
		},
		_convertToAscii: function(arr){},
		setHeader: function(header, value){
			this._headers[header.toLowerCase()] = [ header, value ];

			return header;
		},
		getHeader: function(header){
			return this._headers[header.toLowerCase()];
		},
		delHeader: function(header){
			delete this._headers[header.toLowerCase()];
		},
		hasHeader: function(header){
			// Case-insensitive check for a header
			return header.toLowerCase() in this._headers;
		},
		items: function(){},
		setCookie: function(){},
		deleteCookie: function(){},
		getContent: function(){
			//if self.has_header('Content-Encoding')
			if(this._container){
				return this._container.join('');
			}

			return '';

			//return smart_str(''.join(self._container), self._charset)
		},
		setContent: function(){},
		next: function(){},
		close: function(){},
		write: function(){},
		flush: function(){},
		tell: function(){}
	});

	_.HttpResponse.create({
		__name__: 'HttpResponseRedirect'
		,__parent__: _
		,statusCode: 302
		,__init__: function(redirectTo){
			this._super();
			this.Location= iriToUri(redirectTo);
		}
	});

	_.HttpResponse.create({
		__name__: 'HttpResponsePermanentRedirect'
		,__parent__: _
		,statusCode: 301
		,__init__: function(redirectTo){
			this._super();
			this.setHeader('Location', iriToUri(redirectTo));
		}
	});

	_.HttpResponse.create({
		__name__: 'HttpResponseNotModified'
		,__parent__: _
		,statusCode: 304
	});

	_.HttpResponse.create({
		__name__:  'HttpResponseBadRequest'
		,__parent__: _
		,statusCode: 400
	});

	_.HttpResponse.create({
		__name__: 'HttpResponseNotFound'
		,__parent__: _
		,statusCode: 404
	});

	_.HttpResponse.create({
		__name__: 'HttpResponseForbidden'
		,__parent__: _
		,statusCode: 403
	});

	_.HttpResponse.create({
		__name__: 'HttpResponseNotAllowed'
		,__parent__: _
		,statusCode: 405
		,__init__: function(permittedMethods){
			this._super();
			this.Allow= permittedMethods.join(', ');
		}
	});

	_.HttpResponse.create({
		__name__: 'HttpResponseGone'
		,__parent__: _
		,statusCode: 410
		,__init__: function(){
			this._super();
		}
	});

	_.HttpResponse.create({
		__name__: 'HttpResponseServerError'
		,__parent__: _
		,statusCode: 500
		,__init__: function(){
			this._super();
		}
	});

})(exports);
