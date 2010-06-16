(function(_){
	var
		Entry= project.models.Entry
	;
	
	_.entry= {
		view: function(request, args){
			var
				entry= Entry.objects.get({ id: parseInt(args[0]) })
			;
		}
	};
})(exports);
