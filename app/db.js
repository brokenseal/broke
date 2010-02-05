/****************************************************************************/
/*************************** DATABASE MODULE ********************************/
/****************************************************************************/

(function(){
	/*************************************************************************/
	/************************** BASE QUERY CLASS *****************************/
	/*************************************************************************/
	broke.Class.extend("broke.db.models.Query", {},{
//		init: function(){},
		exclude: function(args){
			return this.filter(args, false);
		},
		create: function(args){
			this.storage.push(args);
			return new this.model(args).save();
		},
		getOrCreate: function(args){
			try {
				return this.get(args);
			} catch(e) {
				if(e.name === 'DoesNotExist') {
					return this.create(args);
				}
				throw e;
			}
		},
		get: function(args){
			var object= null;
			
			if(args) {
				object= this.filter(args).asObject();
			} else {
				object= this.asObject();
			}
			if(object.length > 1) {
				throw this.model.MultipleObjectsReturned("get() returned few %s instances -- it returned %s! Lookup parameters were %s".echo(this.model.className, object.length, args));
			}
			if(!object.length) {
				throw this.model.DoesNotExist("%s matching query does not exist.".echo(this.model.className));
			}
			
			return object[0];
		},
		latest: function(field){
			var field= '',
				filterArgs= {};
			args= args || broke.settings.getLatestBy || 'id';
			
			this.data.each(function(){
				if(field < this[args]) {
					field = this[args];
				}
			});
			// is there a better way?
			filterArgs[field]= max;
			return this.filter(filterArgs).all()[0];
		},
		all: function(){
			return this.asObject();
		}
	});
	
	/*************************************************************************/
	/**************************** LOCAL QUERY ********************************/
	/*************************************************************************/
	broke.db.models.Query.extend("broke.db.models.LocalQuery", {},{
		init: function(model, data){
			this.model= model;
			if(!(this.model.tableName in broke.storage)) {
				broke.storage[this.model.tableName]= [];
			}
			
			this.storage=  broke.storage[this.model.tableName];
			this.data= data || this.storage.clone() || [];
		},
		filterOperations: {
			contains: function(first, second){
				if(first.match(second)) {
					return true;
				}
				return false;
			},
			iContains: function(first, second){
				return this.contains(first.lower(), second.lower());
			},
			startsWith: function(first, second){
				if(first.match("^" + second)) {
					return true;
				}
				return false;
			},
			iStartsWith: function(first, second){
				return this.startsWith(first.lower(), second.lower());
			},
			endsWith: function(first, second){
				if(first.match(second + "$")) {
					return true;
				}
				return false;
			},
			iEndsWith: function(first, second){
				return this.EndsWith(first.lower(), second.lower());
			},
			exact: function(first, second){
				if(first.match("^" + second + "$")) {
					return true;
				}
				return false;
			},
			iExact: function(first, second){
				return this.exact(first.lower(), second.lower());
			},
			'in': function(first, second){
				return second.has(first);
			},
			gt: function(first, second){
				return first > second;
			},
			gte: function(first, second){
				return first >= second;
			},
			lt: function(first, second){
				return first < second;
			},
			lte: function(first, second){
				return first <= second;
			},
			regex: function(first, second){
				return first.match(second);
			},
			iRegex: function(first, second){
				return this.regex(first.lower(), second.lower());
			},
			isNull: function(first, second) {
				return (first === null || first === undefined) ? second : !second;
			},
			year: function(first, second) {
				return (new Date(first).getFullYear()) === second;
			},
			month: function(first, second) {
				return (new Date(first).getMonth() + 1) === second;
			},
			day: function(first, second) {
				return (new Date(first).getDate()) === second;
			},
			weekDay: function(first, second) {
				return (new Date(first).getDay()) === second;
			},
			range: function(first, second) {
				return (second[0] <= first) && (first <= second[1]);
			}
		},
		filter: function(args, negate){
			if(negate === undefined) {
				negate= true;
			}
			var _this= this,
				newData= this.data.filter(function(){
					var splitData= null,
						filterOperation= null,
						key= null,
						newKey= null;
					
					for(key in args) {
						splitData= key.split('__');
						
						if(splitData.length > 1) {
							newKey= splitData[0];
							filterOperation= splitData[1];
							
							if(filterOperation in _this.filterOperations) {
								if(!_this.filterOperations[filterOperation](this.fields[newKey], args[key])) {
									return !negate;
								}
							} else {
								throw broke.exceptions.NotImplemented("Filter operation '" + filterOperation + "' not implemented.");
							}
						} else if(this[key] !== args[key]) {
							return !negate;
						}
					}
					return negate;
				});
			
			return new this.Class(this.model, newData);
		},
		asObject: function(){
			var _this= this;
			this.data.map(function(){
				return new _this.model(this);
			});
			return this.data;
		},
		'delete': function(){
			this.all().each(function(){
				this['delete']();
			});
			
			return null;
		}
	});
	
	/*************************************************************************/
	/**************************** REMOTE QUERY *******************************/
	/*************************************************************************/
	// still not working properly
	broke.db.models.Query.extend("broke.db.models.RemoteQuery", {},{
		init: function(model, newQueryArgs){
			this.model= model;
			this.storage= [];
			this.queryArgs= newQueryArgs || {};
			this.data= [];
		},
		filter: function(args, negate){
			if(negate === undefined) {
				negate= true;
			}
			// how am I supposed to handle 'exclude'?
			return new this.Class(this.model, args);
		},
		asObject: function(){
			var _this= this,
				url= [broke.settings.baseJSONUrl],
				status;
			
			if(_this.model.app_label) {
				url.push(_this.model.app_label);
			}
			url.push(_this.model.className.lower());
			url.push('all/');
			
			$.ajax({
				async: false,
				type: 'GET',
				url: url.join('/'),
				data: this.queryArgs,
				error: function(xhr, textStatus, errorThrown){
					status= textStatus;
				},
				success: function(data, textStatus){
					status= textStatus;
					_this.data= data;
				}
			});
			
			this.data.map(function(){
				return new _this.model(this);
			});
			
			return this.data;
		}
	});
	
	/*************************************************************************/
	/****************************** MANAGER **********************************/
	/*************************************************************************/
	broke.Class.extend("broke.db.models.Manager", {},{
		init: function(model){
			this.model= model;
			this.queryClass= {
				'local': broke.db.models.LocalQuery,
				'remote': broke.db.models.RemoteQuery
			}[broke.settings.queryType];
		},
		all: function(){
			return this.getQuerySet().all();
		},
		create: function(args){
			return this.getQuerySet().create(args);
		},
		exclude: function(args){
			return this.getQuerySet().exclude(args);
		},
		filter: function(args){
			return this.getQuerySet().filter(args);
		},
		get: function(args){
			return this.getQuerySet().get(args);
		},
		getOrCreate: function(args){
			return this.getQuerySet().getOrCreate(args);
		},
		getQuerySet: function(){
			return new this.queryClass(this.model);
		},
		latest: function(args){
			return this.getQuerySet().latest(args);
		}
	});
	
	/*************************************************************************/
	/******************************* MODEL ***********************************/
	/*************************************************************************/
	broke.Class.extend("broke.db.models.Model", {
		init: function(){
			this.objects= new broke.db.models.Manager(this);
			this.baseUrl= "/" + this.app_label + "/" + this.className.lower() + "/json/";
			
			// exceptions
			this.MultipleObjectsReturned= broke.exceptions.MultipleObjectsReturned;
			this.DoesNotExist= broke.exceptions.DoesNotExist;
		},
		elements: function(args){
			// element identifier : e.g. entry_list
			var elementIdentifier= this.className.lower(),
				elements= $('[rel~="' + elementIdentifier + '"]');
			
			if(args) {
				elements= elements.filter(args);
			}
			
			return elements;
		}
	},{
		init: function(args, inheritedFields){
			broke.extend(this, args || {});
			
			// provides primary key access inside the fields
			// is there a better way?
			if(this.fields.pk === undefined){
				this.fields.pk= this.pk;
			}
			
			this.dbReference= args;
		},
		getSlug: function(field){
			return (field || this.fields.title || '').slugify();
		},
		elements: function(args){
			// element identifier : e.g. entry_21
			var elementIdentifier= this.Class.className.lower() + '_' + this.pk,
				elements= $('[rel~="' + elementIdentifier + '"]');
			
			if(args) {
				elements= elements.filter(args);
			}
			
			return elements;
		},
		getForm: function(){
			if(!this.form) {
				var form= this.elements('form');
				
				if(form.length) {
					this.form= form;
				} else {
					this.form= $('<form enctype="multipart/form-data" action="." method="post" style="display:none;" class="PSIXForm">');
					$('body').append(this.form);
				}
			}
			return this.form;
		},
		getAbsoluteUrl: function(){
			return '';
		},
		getOperation: function(del){
			if(del !== undefined && this.fields.pk) {
				return 'delete';
			}
			else if(this.fields.pk) {
				return 'update';
			}
			
			return 'create';
		},
		save: function(saveSettings){
			saveSettings= saveSettings || {};
			
			var status= 'success',
				_this= this,
				className= _this.Class.className.lower(),
				operation= saveSettings.operation ? 'delete' : 'save',
				operationUrl= broke.settings.jsonUrls[operation].render({
					model: className,
					appLabel: _this.Class.appLabel
				});
			
			// trigger model pre_save event
			$(window).trigger('broke.' + className + '.pre_' + operation, [this]);
			
			// load defaults on save settings
			saveSettings= broke.extend(broke.clone(broke.settings.save), saveSettings);
			
			if(saveSettings.commit) {
				if(broke.settings.useAjax) {
					
					$.ajax({
						async: broke.settings.ajax.async,
						type: "POST",
						url: operationUrl,
						data: _this.fields,
						dataType: broke.settings.ajax.dataType,
						error: function(xhr, status, error){
							status= status;
						},
						success: function(data, status){
							if(saveSettings['delete']) {
								status= status;
								return;
							}
							_this.pk= data.pk;
							_this.model= data.model;
							_this.fields.id= _this.pk;
							
							// storage update
							broke.extend(_this.dbReference, {
								pk: _this.pk,
								model: _this.model,
								fields: _this.fields
							});
							
							status= status;
						},
						complete: function(){
							// trigger model post_save event
							$(window).trigger('broke.' + className + '.post_' + operation, [this]);
						}
					});
				} else {
					var form= this.getForm(),
						input= null;
					
					for(var key in data) {
						form.append($('<input type="hidden" name="' + key + '" value="' + data[key] + '"/>'));
					}
					form.submit();
					// trigger model post_save event
					$(window).trigger('broke.' + className + '.post_' + operation, [this]);
				}
			} else {
				// storage update
				broke.extend(this.dbReference, {
					pk: this.pk,
					model: this.model,
					fields: this.fields
				});
			}
			
			return _this;
		},
		'delete': function(settings){
			settings= settings || {};
			settings.operation= 'delete';
			return this.save(settings);
		}
	});
})();
