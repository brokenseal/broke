(function(){
	var patterns= broke.urlResolvers.patterns,
		blog= myProject.apps.blog;
	
	/*************************************************************************/
	/**************************** URL PATTERNS *******************************/
	/*************************************************************************/
	
	blog.urlPatterns= patterns('myProject.apps.blog.views.entry', [
		[ "entry/view/([0-9]+)/$", 'view', 'view' ],
		[ "entry/edit/([0-9]+)/$", 'edit', 'edit' ],
		[ "entry/save/([0-9]+)/$", 'save', 'save' ],
		[ "entry/create/$", 'create', 'create' ],
		[ "entry/delete/([0-9]+)/$", 'delete', 'delete' ]
	]);
})();
