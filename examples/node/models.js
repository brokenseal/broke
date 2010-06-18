(function(_){
	
	var
		utils= require('broke/core/utils')
		,Model= require('broke/db/models/models').Model
	;
	
	Model.extend({
		meta: {
			className: 'Entry'
			,parent: _
		}
		,klass: {
			tableName: 'entry_table'
			,fetchDataUrl: 'fixture.json'
		}
		,prototype: {
			init: function(kwargs){
				this._super(kwargs);
			}
		}
	});
})(exports);
