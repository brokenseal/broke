(function(_){
	var
		broke= require('broke/broke'),
		Class= require('dependencies/class').Class,
		settings= require('broke/conf/settings'),
		Http404= require('broke/http/http').Http404,
		utils= require('broke/core/utils'),
		
		datastructures= require('broke/utils/datastructures'),
		encoding= require('broke/utils/encoding'),
		memoize= require('broke/utils/functional').memoize,
		normalize= require('broke/utils/regex_helper').normalize,
		currentThread= require('broke/utils/thread_support').currentThread,
		
		extend= require('broke/core/utils').extend,
		gettext= require('broke/utils/translation').gettext,
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
						lookupView = utils.requireProperty(modName + '.' + funcName);
						
						if(!utils.isFunction(lookupView)) {
							throw exceptions.AttributeError("'%s.%s' is not a callable." % (mod_name, func_name));
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
				settings= require('broke/conf/settings');
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
		}
	;
	
	getResolver= memoize(getResolver, _resolverCache, 1);
	getCallable= memoize(getCallable);
	
	Http404.extend({
		meta: {
			name: 'Resolver404',
			parent: _
		}
	});
	debugger;
	Class.extend({
		meta: {
			name: 'RegexURLPattern',
			parent: _
		},
		prototype: {
			init: function(regex, callback, defaultArgs, name){
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
			toString: function(){
				return '<%s %s %s>'.echo(this.Class.name, this.name, this.regex.toString().slice(1, -1));
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
					args= args.concat(extraArgs);
					
					return [ this.callback, args ];
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
						
						throw exceptions.ViewDoesNotExist(gettext("Could not import %s. Error was: %s".echo(modName, e.name)));
					} else if(e.name == exceptions.AttributeError) {
						tmpResult= getModFunc(this._callbackStr);
						modName= tmpResult[0];
						funcName= tmpResult[1];
						
						throw exceptions.ViewDoesNotExist(gettext("Tried %s in module %s. Error was: %s" % (funcName, modName, e.name)));
					} else {
						throw e;
					}
				}
				
				return this._callback;
			}
		}
	});
	
	// there is no way in javascript 1.5 to define pure getters and setters
	//_.RegexURLPattern.prototype.callback= property(_.RegexURLPattern.prototype._getCallback)
	
	Class.extend({
		meta: {
			name: 'RegexURLResolver',
			parent: _
		},
		prototype: {
			init: function(regex, urlconfName, defaultArgs, appName, namespace){
				
				// regex is a string representing a regular expression.
				// urlconf_name is a string representing the module containing URLconfs.
				this.regex= new RegExp(regex); // unicode? -> re.compile(regex, re.UNICODE)
				
				this.urlconfName = urlconfName;
				
				if(!(urlconfName instanceof String)) {
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
			toString: function(){
				return '<%s %s (%s:%s) %s>'.echo(this.Class.name, this.urlConfName, this.appName, this.namespace, this.regex.toString().slice(1, -1));
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
					reversedPatterns= reversed(this.urlPatterns),
					pPattern,
					parent,
					piece,
					pArgs,
					args
				;
				
				for(key in reversedPatterns) {
					pattern= reversedPatterns[key];
					pPattern= pattern.regex.toString().slice(1, -1);
					
					if(pPattern.startsWith('^')) {
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
							
							// TODO
						}
					}
				}
			}
		}
	});
	
	extend(_, {
		NoReverseMatch: NoReverseMatch,
		getCallable: getCallable,
		getResolver: getResolver,
		getModFunc: getModFunc
	});
})(exports);
