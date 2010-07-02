(function(_){
	var
		Class= require('dependencies/pyjammin/class').Class,
		gettext= require('broke/utils/translation').gettext.gettext,
		queryModule= require('broke/db/models/query'),
		LocalQuerySet= queryModule.LocalQuerySet,
		RemoteQuerySet= queryModule.RemoteQuerySet,
		QUERY_TYPE= require('broke/conf/settings').settings.QUERY_TYPE
	;
	
	Class.create({
		__name__: 'Manager'
		,__parent__: _
		,__init__: function(model){
			this.model= model;
			//model.objects= this;
			
			this.queryClass= {
				'local': LocalQuerySet,
				'remote': RemoteQuerySet
			}[QUERY_TYPE];
		}
		,contributeToClass: function(model, name){
			// TODO
			this.model= model;
			model.objects= this;
			//this.baseUrl= utils.interpolate("/%s/%s/json/", [this.app_label, this.name.toLowerCase()]);
		}
		,all: function(){
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
})(exports);
