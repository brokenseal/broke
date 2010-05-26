(function(_){
	var
		Class= require('dependencies/class').Class,
		gettext= require('broke/utils/translation/gettext').Class,
		queryModule= broke.db.models.query,
		LocalQuerySet= queryModule.LocalQuerySet,
		RemoteQuerySet= queryModule.RemoteQuerySet,
		QUERY_TYPE= broke.conf.settings.QUERY_TYPE
	;
	
	Class.extend({
		meta: {
			name: 'Manager',
			parent: _
		},
		prototype: {
			init: function(model){
				this.model= model;
				this.queryClass= {
					'local': LocalQuerySet,
					'remote': RemoteQuerySet
				}[QUERY_TYPE];
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
		}
	});
})(exports);
