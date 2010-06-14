(function(__global__){
	
	var
		container
		,list
		,entries
		,project
		,utils
	;
	
	// settings
	require.paths.push('../../../');
	BROKE_SETTINGS_OBJECT= "project.settings";
	
	utils= require('broke/core/utils');
	Model= require('broke/db/models/models').Model;
	
	// build the layout with ukijs
	container= uki({
		view: 'HSplitPane'
		,rect: '0 0 1000 600'
		,background: '#efefef'
		,anchors: 'top left'
		,handlePosition: 300
		,leftMin: 200
		,rightMin: 400
		,anchors: 'left top right bottom'
		,leftChildViews: [{
			view: 'List'
			,rect: '10 10 280 30'
			,anchors: 'top left right'
			,rowHeight: 30
			,rowWidth: 280
		}]
	}).attachTo(__global__, '1000 600');
	
	list= uki('List');
	list.bind('selection', function(obj){
		brokeInterface.request('/entry/view/' + obj.source.selectedIndex() + '/')
	});
	
	// create the project and make it available on the global environment
	project= {
		models: {}
		,settings: require('examples/html/test1/settings')
	};
	__global__.project= project;
	
	// add a model
	Entry= Model.extend({
		meta: {
			className: 'Entry',
			parent: project.models
		},
		klass: {
			tableName: 'entry_table'
		},
		prototype: {
			init: function(kwargs){
				this._super(kwargs);
			}
		}
	});
	
	// init broke
	brokeInterface.extendUtils();
	brokeInterface.init();
	
	// get all the entries
	brokeInterface.fetchData({
		url: 'fixture.json'
		,model: Entry
		,callback: function(data, storage){
			entries= data;
			
			// fill the list
			$.each(Entry.objects.all(), function(){
				list.addRow(0, this.fields.title);
			});
		}
	});
	
})(this);
