(function(_){
	var
		utils= require('broke/core/utils')
		,Model= require('broke/db/models/models').Model
		,Entry
	;
	
	Entry= Model.create({
		__name__: 'Entry'
		,__parent__: _
		,__init__: function(kwargs){
			this._super(kwargs);
		}
	});
	Entry.tableName= 'entry_table';
	Entry.fetchDataUrl= 'fixture.json';
	
})(exports);
