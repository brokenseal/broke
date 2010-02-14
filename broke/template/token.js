/*
 * tokentype:
 * 0 TAG_TOKEN
 * 1 VAR_TOKEN
 * 2 TEXT_TOKEN
*/
(function(){
	broke.Class.extend("broke.template.Token", {
		init: function(type, content){
			this.type= type;
			this.content= content.replace(/^\s+|\s+$/g,'');
		},
		tsplit: function(){}
	});
})();
