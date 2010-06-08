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
		klass: {
			init: function(){
				this.appLabel= 'blog';
				this.tableName= "%s_%s".echo(this.appLabel, this.name.lower());
				
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
