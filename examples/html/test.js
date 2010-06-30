(function(__global__){
	
	var
		container
		,lists
		,entries
		,project
		,utils
		,Model
		,interface
	;
	
	// settings
	require.paths.push('../../');
	__global__.BROKE_SETTINGS_MODULE= 'examples/html/settings';
	
	interface= require('broke/interfaces/browser');
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
			,rect: '10 10 280 200'
			,anchors: 'top left right'
			,rowHeight: 30
			,rowWidth: 280
		}]
		,rightChildViews: [{
			view: 'List'
			,rect: '10 10 620 600'
			,anchors: 'top left right'
			,rowHeight: 30
			,rowWidth: 620
		}]
	}).attachTo(__global__, '1000 600');
	
	lists= uki('List');
	box= uki('Box');
	lists[0].bind('selection', function(obj){
		interface.request('/entry/view/' + obj.source.selectedIndex() + '/');
	});
	
	// create the project and make it available on the global environment
	project= {
		models: {}
		,leftList: lists[0]
		,rightList: lists[1]
		,box: box
		
	};
	// make the project available outside this module
	__global__.project= project;
	
	// add a model
	Entry= Model.create({
		__name__: 'Entry'
		,__parent__: project.models
		,__init__: function(kwargs){
			this._super(kwargs);
		}
	});
	Entry.tableName= 'entry_table';
	Entry.fetchDataUrl= 'fixture.json';
	
	$(window).bind('broke.ready', function(){
		// fill the list
		$.each(Entry.objects.all(), function(){
			project.leftList.addRow(0, this.fields.title);
		});
	});
	
	// init broke
	interface.extendUtils();
	interface.init();
})(this);
