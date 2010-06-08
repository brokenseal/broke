(function(__global__){
	
	var
		container
		,list
		,entries
	;
	
	// build the layout with ukijs
	container= uki({
		view: 'HSplitPane'
		,rect: '0 0 960 500'
		,background: '#efefef'
		,anchors: 'top left'
		,maxLeft: '300'
		,minLeft: '300'
		,leftChildViews: [
			{
				view: 'List'
				,rect: '10 10 180 30'
				,anchors: 'top left right'
				,rowHeight: 30
				,rowWidth: '100%'
			}
		]
	}).attachTo(__global__);
	
	list= uki('List');
	list.isSelected();
	
	// create the project
	__global__.project= {
		models: {}
		,settings: {
			DEBUG: true
		}
	};
	
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
