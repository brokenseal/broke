(function(){
	var Model= broke.models.Model;
	
	// Entry
	Model.extend("myProject.apps.blog.models.Entry", {
		init: function(){
			this.appLabel= 'blog';
			this.tableName= "%s_%s".echo(this.appLabel, this.className.lower());
			
			this._super();
		}
	},{
		init: function(args){
			this._super(args);
		}
	});
})();
