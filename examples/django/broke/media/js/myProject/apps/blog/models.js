(function(__global__){
	var
		Model= require('broke/db/models/models').Model
	;
	
	// Entry
	Model.extend({
		meta: {
			className: 'Entry',
			parent: myProject.apps.blog.models
		},
		static: {
			init: function(){
				this.appLabel= 'blog';
				this.tableName= utils.interpolate("%s_%s", [this.appLabel, this.name.toLowerCase()]);
				
				this._super();
			},
			autoInit: true
	//		title: fields.CharField({ maxLength: 200, null: false, blank: false})
	//		body: fields.TextField(),
	//		pub_date: fields.DateField({ 'default': (new Date())})
		},
		prototype: {
			init: function(args){
				this._super(args);
			}
		}
	});
})(this);
