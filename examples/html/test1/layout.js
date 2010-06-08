(function(__global__){
	
	var
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
		}).attachTo(__global__)
	;
	
})(this);
