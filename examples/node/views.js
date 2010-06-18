(function(_){
	var
		settings= require('broke/conf/settings')
		,utils= require('broke/core/utils')
		,Entry= require('examples/node/models').Entry
	;
	
	_.entry= {
		view: function(request){
			return 'Hello world!';
		}
	};
})(exports);
