(function(_){
	var
		utils
		,interface
	;
	
	global.BROKE_SETTINGS_OBJECT= "examples/node/settings";
	require.paths.push('../../../');
	
	utils= require('broke/core/utils');
	interface= require('dependencies/browser_interface');
	
	interface.init();
})(exports);
