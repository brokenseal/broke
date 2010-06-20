(function(_){
	var
		utils
		,interface
	;
	
	global.BROKE_SETTINGS_MODULE= "examples/node/settings";
	require.paths.push('../../');
	
	utils= require('broke/core/utils');
	interface= require('broke/interfaces/node');
	
	interface.init();
})(exports);
