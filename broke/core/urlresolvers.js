(function(_){
	var
		broke= require('broke/broke'),
		Class= require('dependencies/pyjammin/class').Class,
		settings= require('broke/conf/settings').settings,
		Http404= require('broke/http/http').Http404,
		utils= require('broke/core/utils'),

		MultiValueDict= require('broke/utils/datastructures').MultiValueDict,
		encoding= require('broke/utils/encoding'),
		memoize= require('broke/utils/functional').memoize,
		normalize= require('broke/utils/regex_helper').normalize,
		currentThread= require('broke/utils/thread_support').currentThread,

		extend= require('broke/core/utils').extend,
		gettext= require('broke/utils/translation').gettext.gettext,
		exceptions= require('broke/core/exceptions'),
		NoReverseMatch= exceptions.NoReverseMatch,
		ImproperlyConfigured= exceptions.ImproperlyConfigured,
		ViewDoesNotExist= exceptions.ViewDoesNotExist,

		_resolverCache = {}, // Maps URLconf modules to RegexURLResolver instances.
		_callableCache = {} // Maps view and url pattern names to their view functions.

		//SCRIPT_NAME prefixes for each thread are stored here. If there's no entry for
		//the current thread (which is the only one we ever access), it is assumed to
		//be empty.
		_prefixes = {},

		// Overridden URLconfs for each thread are stored here.
		_urlConfs = {},

		NoReverseMatch= function(message){
			return {
				name: "PermissionDenied",
				message: message,
				// Don't make this raise an error when used in a template.
				silentVariableFailure: true
			}
		},
		getCallable= function(lookupView, canFail){
			/*
			Convert a string version of a function name to the callable object.

			If the lookup_view is not an import path, it is assumed to be a URL pattern
			label and the original string is returned.

			If can_fail is True, lookup_view might be a URL pattern label, so errors
			during the import fail and the string is returned.
			*/
			var
				tmp,
				modName,
				funcName
			;
			canFail= canFail || false;

			if(utils.isFunction(lookupView)) {
				try {
					// Bail early for non-ASCII strings (they can't be functions).
					//lookupView = lookupView.encode('ascii');
					tmp= getModFunc(lookupView);
					modName= tmp[0];
					funcName= tmp[1];

					if(funcName != '') {
						lookupView = utils.getCallable(modName + '.' + funcName);

						if(!utils.isFunction(lookupView)) {
							throw new exceptions.AttributeError("'%s.%s' is not a callable." % (mod_name, func_name));
						}
					}

				} catch(e) {
					if(e.name == exceptions.ImportError.name || e.name == exceptions.AttributeError.name) {
						if(!canFail) {
							throw e;
						}
					} else if(e.name == exceptions.UnicodeEncodeError.name) {

					} else {
						throw e;
					}
				}
			}

			return lookupView;
		},
		getResolver= function(urlConf){
			var
				settings
			;

			if(!urlConf) {
				settings= require('broke/conf/settings').settings;
				urlConf= settings.ROOT_URLCONF;
			}

			return _.RegexURLResolver('^/', urlConf);
		},
		getModFunc= function(callback){
			// Converts 'django.views.news.stories.story_detail' to
			// ['django.views.news.stories', 'story_detail']
			var dot;

			try {
				dot= callback.rindex('.');
			} catch(e) {
				if(e.name == exceptions.ValueError.name) {
					return [callback, ''];
				} else {
					throw e;
				}
			}

			return callback.slice(0, dot), callback.slice(dot+1);
		},
		parseQueryString= function(queryString){
			var
				querySplit,
				result= {}
			;

			if(!queryString) {
				return result;
			}

			querySplit= queryString.split('&');

			utils.forEach(querySplit, function(){
				var
					keyValue= this.split('=')
				;

				result[keyValue[0]]= keyValue[1];
			});

			return result;
		},
		resolve= function(path, urlConf){
			if(urlConf === undefined) {
				urlConf= getUrlConf();
			}

			return getResolver(urlConf).resolve(path);
		},
		reverse= function(args){
			var
				resolver,
				view,
				parts,
				path,
				resolvedPath,
				ns,
				appList,
				extra,
				tmpResult
			;

			args= utils.extend({
				viewName: null,
				urlConf: null,
				args: null,
				prefix: null,
				currentApp: null
			}, args);

			if(args.urlConf === null) {
				urlConf= getUrlConf();
			}

			resolver= getResolver(urlConf);
			args.args= args.args || [];

			if(args.prefix === null) {
				args.prefix= getScriptPrefix();
			}

			if(!(args.viewName instanceof String)) {
				view= viewName;
			} else {
				parts= viewName.split(':').reverse();
				view= parts[0];
				path= parts.slice(1);

				resolvedPath= [];

				while(path.length){
					ns= path.pop();

					// Lookup the name to see if it could be an app identifier
					try {
						appList= resolver.appDict[ns];
						// Yes! Path part matches an app in the current Resolver

						if(args.currentApp && args.currentApp in appList) {
							// If we are reversing for a particular app, use that namespace
							ns= currentApp;
						} else if(!(ns in appList)) {
							// The name isn't shared by one of the instances (i.e., the default)
							// so just pick the first instance as the default.
							ns= appList[0];
						}
					} catch(e) {
						if(e.name != exceptions.KeyError.name) {
							throw e;
						}
					}

					try {
						tmpResult= resolver.namespaceDict[ns];
						extra= tmpResult[0];
						resolver= tmpResult[1];

						resolvedPath.push(ns);
						args.prefix= args.prefix + extra;
					} catch(e) {
						if(e.name == exceptions.KeyError) {
							if(resolvedPath.length) {
								throw new exceptions.NoReverseMatch(utils.interpolate(gettext("%s is not a registered namespace inside '%s'", [key, resolvedPath.join(':')])));
							} else {
								throw new exceptions.NoReverseMatch(utils.interpolate(gettext("%s is not a registered namespace", key)));
							}
						} else {
							throw e;
						}
					}
				}
			}
			// TODO: check that
			return iriToUri(utils.interpolate("%s%s", [prefix, resolver.reverse.apply(resolver, [view].concat(args))]));
		},
		clearUrlCaches= function(){
			_resolver_cache.clear();
			_callable_cache.clear();
		},
		setScriptPrefix= function(prefix){
			// Sets the script prefix for the current thread.
			// TODO: check that

			if(!utils.endsWith(prefix, '/')) {
				prefix+= '/';
			}

			_prefixes[currentThread()]= prefix;
		},
		getScriptPrefix= function(){
			/*
			Returns the currently active script prefix. Useful for client code that
			wishes to construct their own URLs manually (although accessing the request
			instance is normally going to be a lot cleaner).
			*/

			return _prefixes[currentThread()] || '/';
		},
		setUrlConf= function(urlConfName){
			// Sets the URLconf for the current thread (overriding the default one in
			// settings). Set to None to revert back to the default.
			var
				thread= currentThread()
			;

			if(urlConfName) {
				_urlConfs[thread]= urlConfName;
			} else {
				// faster than wrapping in a try/except
				if(thread in _urlConfs) {
					delete _urlConfs[thread];
				}
			}
		},
		getUrlconf= function(defaultUrlconf) {
			// Returns the root URLconf to use for the current thread if it has been
			// changed from the default one.
			var
				thread= currentThread()
			;

			if(thread in _urlConfs) {
				return _urlConfs[thread];
			}

			return defaultUrlconf;
		}
	;

	getResolver= memoize(getResolver, _resolverCache, 1);
	getCallable= memoize(getCallable);

	Http404.create({
		__name__: 'Resolver404'
		,__parent__: _
		,__init__: function(kwargs){
			var
				message= utils.interpolate('Cannot resolve the path "%s", tried: %s', [kwargs.path, kwargs.tried]);
			;

			this._super(message);
		}
	});

	Class.create({
		__name__: 'RegexURLPattern'
		,__parent__: _
		,__init__: function(regex, callback, defaultArgs, name){
			this.regex= new RegExp(regex); // force unicode? -> re.compile(regex, re.UNICODE)
			// regex is a string representing a regular expression.
			// callback is either a string like 'foo.views.news.stories.story_detail'
			// which represents the path to a module and a view function name, or a
			// callable object (view).
			if(utils.isFunction(callback)) {
				this._callback= callback;
			} else {
				this._callback= null;
				this._callbackStr= callback;
			}

			this.defaultArgs= defaultArgs || [];
			this.name= name || null;
		},
		__str__: function(){
			return utils.interpolate('<%s %s %s>', [this.__class__.__name__, this.name, this.regex.toString().slice(1, -1)]);
		},
		addPrefix: function(prefix) {
			/*
			Adds the prefix string to a string-based callback.
			*/
			if(!prefix || !('_callbackStr' in this)) {
				return;
			}

			this._callbackStr= prefix + '.' + self._callbackStr;
		},
		resolve: function(path) {
			var
				match= this.regex.exec(path),
				args,
				extraArgs= Array.prototype.slice.call(arguments, 1)
			;

			if(match) {
				// Pass all non-named arguments as positional arguments.
				args= match.slice(1);

				// Pass any additional argument
				args= args.concat(this.defaultArgs).concat(extraArgs);

				return [ this._getCallback(), args ];
			}
		},
		_getCallback: function(self) {
			var
				tmpResult,
				modName,
				funcName
			;

			if(this._callback !== null) {
				return this._callback;
			}

			try {
				this._callback= getCallable(this._callbackStr);
			} catch(e) {
				if(e.name == esceptions.ImportError) {
					tmpResult= getModFunc(this._callbackStr);
					modName= tmpResult[0];
					funcName= tmpResult[1];

					throw new exceptions.ViewDoesNotExist(utils.interpolate(gettext("Could not import %s. Error was: %s", [modName, e.name])));
				} else if(e.name == exceptions.AttributeError) {
					tmpResult= getModFunc(this._callbackStr);
					modName= tmpResult[0];
					funcName= tmpResult[1];

					throw new exceptions.ViewDoesNotExist(gettext("Tried %s in module %s. Error was: %s" % (funcName, modName, e.name)));
				} else {
					throw e;
				}
			}

			return this._callback;
		}
	});

	// there is no way in javascript 1.5 to define pure getters and setters
	//_.RegexURLPattern.prototype.callback= property(_.RegexURLPattern.prototype._getCallback)

	Class.create({
		__name__: 'RegexURLResolver'
		,__parent__: _
		,__init__: function(regex, urlConfName, defaultArgs, appName, namespace){

			// regex is a string representing a regular expression.
			// urlconf_name is a string representing the module containing URLconfs.
			this.regex= new RegExp(regex); // unicode? -> re.compile(regex, re.UNICODE)

			this.urlConfName = urlConfName;

			if(!(utils.typeOf(urlConfName) == "string")) {
				this._urlConfModule= this.urlConfName;
			}

			this.callback= null;
			this.defaultArgs= defaultArgs || [];
			this.namespace = namespace || null;
			this.appName = appName || null;

			this._reverseDict = null;
			this._namespaceDict= null;
			this._appDict= null;
		},
		__str__: function(){
			return utils.interpolate('<%s %s (%s:%s) %s>', [this.__class__.__name__, this.urlConfName, this.appName, this.namespace, this.regex.toString().slice(1, -1)]);
		},
		_populate: function(){
			var
				lookups = new MultiValueDict(),
				namespaces = {},
				apps = {},
				pattern,
				key,
				_key,
				__key,
				___key,
				suffix,
				name,
				tmpResult,
				_tmpResult,
				matches,
				newMatches,
				pat,
				i,
				len,
				reversedPatterns= reversed(this._getUrlPatterns()),
				pPattern,
				parent,
				piece,
				pArgs,
				args
			;

			for(key in reversedPatterns) {
				pattern= reversedPatterns[key];
				pPattern= pattern.regex.toString().slice(1, -1);

				if(utils.startsWith(pPattern, ('^'))) {
					pPattern= pPattern.slice(1);
				}

				if(pattern instanceof _.RegexURLResolver) {
					if(pattern.namespace) {
						namespaces[pattern.namespace]= [pPattern, pattern];

						if(pattern.appName) {
							// TODO: check
							apps[pattern.appName]= [pattern.namespace];
						}
					} else {
						parent= normalize(pattern.regex.toString().slice(1, -1));

						for(key in pattern.reverseDict) {
							name= pattern.reverseDict[key];

							for(_key in pattern.reverseDict.getList(name)) {
								tmpResult= pattern.reverseDict.getList(name)[_key];
								matches= tmpResult[0];
								pat= tmpResult[1];

								newMatches= [];

								for(__key in parent) {
									_tmpResult= parent[__key];
									piece= _tmpResult[0];
									pArgs= _tmpResult[1];

									newMatches= newMatches.concat([  ]);

									for(i= 0, len= matches.length; i< len; i++) {
										suffix= matches[i][0];
										args= matches[i][1];

										newMatches.push([ piece + suffix, pArgs.concat(args) ]);
									}
								}

								lookups.appendList(name, [ newMatches, pPattern + pat ]);
							}
						}

						forEach(pattern.namespaceDict, function(){
							var
								namespace= this[0],
								prefix= this[1][0],
								subPattern= this[1][1]
							;

							namespace[namespace]= [ pPattern + prefix, subPattern ];
						});

						forEach(pattern.appDict, function(key){
							apps[appName]= [].concat(namespaceList);
						});
					}
				} else {
					bits = normalize(pPattern);
					lookups.appendlist(pattern.callback, [ bits, pPattern ])
					lookups.appendlist(pattern.name, [ bits, pPattern ])
				}
			}

			this._reverseDict = lookups;
			this._namespaceDict = namespaces;
			this._appDict = apps;
		},
		_getReverseDict: function(){
			if(this._reverseDict == null) {
				this._populate();
			}

			return this._reverseDict;
		},
		_getNamespaceDict: function(){
			if(this._namespaceDict == null) {
				this._populate();
			}

			return this._namespaceDict;
		},
		_getAppDict: function() {
			if(this._appDict == null) {
				this._populate();
			}

			return this._appDict;
		},
		resolve: function(path) {
			var
				_this= this,
				tried= [],
				subTried = null,
				match= this.regex.exec(path),
				subMatch,
				newPath,
				pattern,
				urlPatterns,
				subMatchArr= [],
				i,
				len
			;

			if(match) {
	            // new_path = path[match.end():]
				// how am i going to translate this?
				// TODO
				//newPath= path[1];

				newPath= path.slice(path.indexOf(match[0]) + match[0].length);
				urlPatterns= this._getUrlPatterns();

				for(i= 0, len= urlPatterns.length; i< len; i++) {
					pattern= urlPatterns[i];

					try {
						subMatch= pattern.resolve(newPath);

						if(subMatch) {
							subMatchArr= subMatch.slice(1).concat(_this.defaultArgs).concat(subMatch.slice(1));
							return [ subMatch[0], subMatch[1], subMatchArr ];
						}

						tried.push(pattern.regex.toString.slice(1, -1));
					} catch(e) {
						if(e.name == _.Resolver404.name) {
		                    //sub_tried = e.args[0].get('tried')
							// TODO
							//subTried=

							if(subTried !== null) {
								forEach(subTried, function(){
									tried.push([ pattern.regex.toString().slice(1, -1) + '   ' + t ]);
								});
							} else {
								tried.push(pattern.regex.toString().slice(1, -1));
							}
						}
					}
				}

				throw new _.Resolver404({ tried: tried, path: newPath });
			}

			throw new _.Resolver404({ path: path });
		},
		_getUrlConfModule: function(){
			if(this._urlConfModule) {
				return this._urlConfModule;
			}

			this._urlConfModule= require(this.urlConfName);

			return this._urlConfModule;
		},
		_getUrlPatterns: function(){
			var
				patterns
			;

			if(this.urlPatterns) {
				return this.urlPatterns;
			}

			this._getUrlConfModule();
			patterns= utils.getattr('urlpatterns', this._urlConfModule);

			if(patterns === undefined) {
				throw new ImproperlyConfigured(utils.interpolate("The included urlconf %s doesn't have any patterns in it", this.urlConfName));
			}

			// save it for later use
			this.urlPatterns= patterns;

			return patterns;
		},
		_resolveSpecial: function(viewType){
			var
				callback,
				handlerName= utils.interpolate('handler%s', viewType)
			;

			this._getUrlConfModule();
			callback= utils.getattr(this.urlConfModule, handlerName);

			if(!callback || !utils.isFunction(callback)) {
				throw new exceptions.ViewDoesNotExist(utils.interpolate("The handler %s doesn not exist.", handlerName));
			}
		},
		resolve404: function() {
			return self._resolveSpecial('404');
		},
		resolve500: function(){
			return self._resolveSpecial('500');
		},
		reverse: function(lookupView){
			var
				args= Array.prototype.slice.call(arguments).slice(1),
				possibilities,
				key,
				_key
				possibility,
				pattern,
				result,
				params,
				candidate,
				lookupViewS,
				m,
				n
			;

			try {
				lookupView= utils.getCallable(lookupView);
			} catch(e) {
				if(e.name == exceptions.ImportError || e.name == exceptions.AttributeError) {
					throw new NoReverseMatch(utils.interpolate(gettext("Error importing '%s': %s."), [lookupView, e]));
				} else {
					throw e;
				}
			}

			possibilities= this.reverseDict.getList(lookupView);

			for(key in possibilities) {
				possibility= possibilities[key][0];
				pattern= possibilities[key][1];

				for(_key in possibility) {
					result= possibility[_key][0];
					params= possibility[_key][1];

					if(args) {
						if(args.length != params.length) {
							continue;
						}

						// TODO ?
						//unicode_args = [force_unicode(val) for val in args]

						// TODO better
						candidate= utils.interpolate(result, args);
					}

					if(utils.interpolate("^%s", pattern).match(candidate)) {
						return candidate;
					}
				}
			}
			// lookupView can be URL label, or dotted path, or callable, Any of
			// these can be passed in at the top, but callables are not friendly in
			// error messages.
			m = utils.getattr(lookupView, _, null);
			// TODO
			//n = utils.getattr(lookupView, '__name__', null);

			if(m !== null && n !== null) {
				lookupViewS = utils.interpolate("%s.%s", [m, n]);
			} else {
				lookupViewS = lookupView;
			}

			throw new NoReverseMatch("Reverse for '%s' with arguments '%s' not found." % (lookupViewS, args, kwargs))
		}
	});

	// there is no way in javascript 1.5 to define pure getters and setters
	//_.RegexURLResolver.prototype.reverse_dict= property(_.RegexURLPattern.prototype._get_reverse_dict)
	//_.RegexURLResolver.prototype.namespace_dict= property(_.RegexURLPattern.prototype._get_namespace_dict)
	//_.RegexURLResolver.prototype.app_dict= property(_.RegexURLPattern.prototype._get_app_dict)

	extend(_, {
		NoReverseMatch: NoReverseMatch,
		getCallable: getCallable,
		getResolver: getResolver,
		getModFunc: getModFunc,
		parseQueryString: parseQueryString,
		resolve: resolve,
		reverse: reverse,
		clearUrlCaches: clearUrlCaches,
		setScriptPrefix: setScriptPrefix,
		getScriptPrefix: getScriptPrefix,
		setUrlConf: setUrlConf,
		getUrlconf: getUrlconf
	});
})(exports);