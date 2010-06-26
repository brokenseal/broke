(function(_){
	var
		utils= require('broke/core/utils'),
		Class= require('dependencies/class').Class,
		gettext= require('broke/utils/translation').gettext.gettext,
		exceptions= require('broke/core/exceptions'),
		settings= require('broke/conf/settings').settings
		
		,BaseArray= Class.extend.call(Array, {
			meta: {
				className: 'BaseArray',
				parent: _
			}
		})
	;
	
	/*************************************************************************/
	/************************** BASE QUERYSET CLASS **************************/
	/*************************************************************************/
	BaseArray.extend({
		meta: {
			className: 'QuerySet',
			parent: _
		},
		prototype: {
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
					throw new this.model.MultipleObjectsReturned(utils.interpolate(gettext("get() returned few %s instances -- it returned %s! Lookup parameters were %s"), [this.model.className, object.length, args]));
				}
				if(!object.length) {
					throw new this.model.DoesNotExist(utils.interpolate(gettext("%s matching query does not exist."), this.model.className));
				}
				
				return object[0];
			},
			latest: function(field){
				// TODO: does this even work?
				var filterArgs= {},
					args= field || settings.GET_LATEST_BY || 'id',
					max;
				field= '';
				
				//this.each(function(){
				utils.forEach(this, function(){
					if(field < this[args]) {
						max= this[args];
					}
				});
				
				// is there a better way?
				filterArgs[field]= max;
				return this.filter(filterArgs).all()[0];
			},
			all: function(){
				return this.asObject();
			}
		}
	});
	
	/*************************************************************************/
	/*************************** LOCAL QUERYSET ******************************/
	/*************************************************************************/
	_.QuerySet.extend({
		meta: {
			className: 'LocalQuerySet',
			parent: _
		},
		prototype: {
			init: function(model, data){
				var
					i,
					len
				;
				
				this.model= model;
				if(!(this.model.tableName in utils.storage)) {
					utils.storage[this.model.tableName]= [];
				}
				
				this.storage=  utils.storage[this.model.tableName];
				data= data || this.storage.concat([]) || [];
				
				for(i= 0, len= data.length; i< len; i++) {
					this.push(data[i]);
				}
			},
			filterOperations: {
				contains: function(first, second){
					if(first.match(second)) {
						return true;
					}
					return false;
				},
				iContains: function(first, second){
					return this.contains(first.toLowerCase(), second.toLowerCase());
				},
				startsWith: function(first, second){
					if(first.match("^" + second)) {
						return true;
					}
					return false;
				},
				iStartsWith: function(first, second){
					return this.startsWith(first.toLowerCase(), second.toLowerCase());
				},
				endsWith: function(first, second){
					if(first.match(second + "$")) {
						return true;
					}
					return false;
				},
				iEndsWith: function(first, second){
					return utils.EndsWith(this, first.toLowerCase(), second.toLowerCase());
				},
				exact: function(first, second){
					if(first.match("^" + second + "$")) {
						return true;
					}
					return false;
				},
				iExact: function(first, second){
					return this.exact(first.toLowerCase(), second.toLowerCase());
				},
				'in': function(first, second){
					return utils.has(second, first);
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
					return this.regex(first.toLowerCase(), second.toLowerCase());
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
				var
					_this= this
					,newData= utils.filter(this, function(){
						var
							splitData= null,
							filterOperation= null,
							key= null,
							newKey= null
						;
						
						for(key in args) {
							if(args.hasOwnProperty(key)) {
								splitData= key.split('__');
								
								if(splitData.length > 1) {
									newKey= splitData[0];
									filterOperation= splitData[1];
									
									if(filterOperation in _this.filterOperations) {
										if(!_this.filterOperations[filterOperation](this.fields[newKey], args[key])) {
											return !negate;
										}
									} else {
										throw new exceptions.NotImplementedError(utils.interpolate(gettext("Filter operation %s not implemented."), filterOperation));
									}
								} else if(this[key] != args[key]) {
									return !negate;
								}
							}
						}
						return negate;
					})
				;
				
				return new this.Class(this.model, newData);
			},
			asObject: function(){
				var _this= this;
				
				return utils.map(this, function(){
					return new _this.model(this);
				});
			},
			'delete': function(){
				//this.all().each(function(){
				utils.forEach(this.all(), function(){
					this['delete']();
				});
				
				return null;
			}
		}
	});
	
	/*************************************************************************/
	/**************************** REMOTE QUERY *******************************/
	/*************************************************************************/
	_.QuerySet.extend({
		meta: {
			className: 'RemoteQuerySet',
			parent: _
		},
		static: {
			
		},
		prototype: {
			init: function(model, newQueryArgs){
				this.model= model;
				this.storage= [];
				this.queryArgs= newQueryArgs || {};
			},
			filter: function(args, negate){
				if(negate === undefined) {
					negate= true;
				}
				args= utils.extend(this.queryArgs, args);
				// how am I supposed to handle 'exclude'?
				return new this.Class(this.model, args);
			},
			asObject: function(){
				var _this= this,
					url= settings.JSON_URLS.getData.interpolate({
						appLabel: _this.model.appLabel,
						model: _this.model.className.toLowerCase()
					}),
					status;
				
				$.ajax({
					async: false,
					type: 'GET',
					url: url,
					data: this.queryArgs,
					dataType: settings.AJAX.dataType,
					error: function(xhr, textStatus, errorThrown){
						status= textStatus;
					},
					success: function(data, textStatus){
						var
							i, 
							len
						;
						
						status= textStatus;
						
						for(i= 0, len= data.length; i< len; i++) {
							_this.push(data[i]);
						}
					}
				});
				
				utils.map(this, function(){
					return new _this.model(this);
				});
				
				return this;
			}
		}
	});
})(exports);
