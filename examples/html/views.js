(function(_){
	var
		settings= require('broke/conf/settings').settings
		,utils= require('broke/core/utils')
		,Entry= project.models.Entry
		,shortcuts= require('broke/shortcuts')
		,create= shortcuts.html.create
		,update= shortcuts.html.update
		
		,home= function(request){
			return 'Welcome home!';
		}
		,entry_view= function(request, pk){
			var
				entry= Entry.objects.get({ pk: pk })
			;
			
			return create({
				htmlNode: $('body')[0]
				,method: null
				,template: 'entry_view.html'
				,context: {
					object: entry.fields.title
				}
				,callback: function(){
					project.rightList.addRow(0, this);
				}
			});
		}
	;
	
	utils.extend(_, {
		home: home
		,entry_view: entry_view
	});
})(exports);
