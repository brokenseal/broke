(function(__global__){
	var
		Model= require('broke/db/models/models').Model
	;

	// Entry
	Model.create({
		__name__: 'Entry'
		,__parent__: 'myProject.apps.blog.models'
		,__static__: {
			__init__: function(){
				this.appLabel= 'blog';
				this.tableName= utils.interpolate("%s_%s", [this.appLabel, this.name.toLowerCase()]);

				this._super();
			},
			autoInit: true
	//		title: fields.CharField({ maxLength: 200, null: false, blank: false})
	//		body: fields.TextField(),
	//		pub_date: fields.DateField({ 'default': (new Date())})
		},
		,__init__: function(args){
			this._super(args);
		}
	});
})(this);
