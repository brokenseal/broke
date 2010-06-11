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
	Entry= Class({
		meta: {
			className: 'Entry',
			parent: project.models
		},
		klass: {
			tableName: 'entry'
		},
		prototype: {
			init: function(kwargs){
				this.id= kwargs.id;
				this.title= kwargs.title;
				this.description= kwargs.description;
			}
		}
	});
	
	// init broke
	brokeInterface.init();
	
	// get all the entries
	brokeInterface.fetchData({
		url: 'fixture.json',
		model: Entry,
		callback: function(data, storage){
			entries= data;
			
			// fill the list
			$.each(entries, function(){
				list.addRow(0, this.title);
			});
		}
	});
	
})(this);
