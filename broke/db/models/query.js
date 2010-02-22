(function(){
	var gettext= broke.utils.translation.gettext;
	
	/*************************************************************************/
	/************************** BASE QUERYSET CLASS **************************/
	/*************************************************************************/
	broke.Class.extend("broke.db.models.QuerySet",{
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
				throw this.model.MultipleObjectsReturned(gettext("get() returned few %s instances -- it returned %s! Lookup parameters were %s").echo(this.model.className, object.length, args));
			}
			if(!object.length) {
				throw this.model.DoesNotExist(gettext("%s matching query does not exist.").echo(this.model.className));
			}
			
			return object[0];
		},
		latest: function(field){
			// TODO: does this even work?
			var filterArgs= {},
				args= field || broke.conf.settings.GET_LATEST_BY || 'id',
				max;
			field= '';
			
			this.data.each(function(){
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
	});
	
	/*************************************************************************/
	/*************************** LOCAL QUERYSET ******************************/
	/*************************************************************************/
	broke.db.models.QuerySet.extend("broke.db.models.LocalQuerySet",{
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
									throw broke.exceptions.NotImplemented(gettext("Filter operation %s not implemented.").echo(filterOperation));
								}
							} else if(this[key] !== args[key]) {
								return !negate;
							}
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
	broke.db.models.QuerySet.extend("broke.db.models.RemoteQuerySet",{
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
			args= broke.extend(this.queryArgs, args);
			// how am I supposed to handle 'exclude'?
			return new this.Class(this.model, args);
		},
		asObject: function(){
			var _this= this,
				url= broke.conf.settings.JSON_URLS.getData.interpolate({
					appLabel: _this.model.appLabel,
					model: _this.model.className.lower()
				}),
				status;
			
			$.ajax({
				async: false,
				type: 'GET',
				url: url,
				data: this.queryArgs,
				dataType: broke.conf.settings.AJAX.dataType,
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
})();
