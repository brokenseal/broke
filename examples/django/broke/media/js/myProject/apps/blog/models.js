(function(){
	var Model= broke.db.models.Model;
	
	// Entry
	Model.extend("myProject.apps.blog.models.Entry", {
		init: function(){
			this.appLabel= 'blog';
			this.tableName= "%s_%s".echo(this.appLabel, this.className.lower());
			
			this._super();
		},
		autoInit: true
//		title: fields.CharField({ maxLength: 200, null: false, blank: false})
//		body: fields.TextField(),
//		pub_date: fields.DateField({ 'default': (new Date())})
	},{
		init: function(args){
			this._super(args);
		}
	});
})();
