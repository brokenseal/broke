(function(){
	var
		patterns= require('broke/core/urlresolvers').patterns,
		blog= myProject.apps.blog
	;
	
	/*************************************************************************/
	/**************************** URL PATTERNS *******************************/
	/*************************************************************************/
	
	blog.urlPatterns= [
		[ "entry/view/([0-9]+)/$", myProject.apps.blog.views.entry.view, 'entry-view' ],
		[ "entry/edit/([0-9]+)/$", myProject.apps.blog.views.entry.edit, 'entry-edit' ],
		[ "entry/save/([0-9]+)/$", myProject.apps.blog.views.entry.save, 'entry-save' ],
		[ "entry/create/$", myProject.apps.blog.views.entry.create, 'entry-create' ],
		[ "entry/delete/([0-9]+)/$", myProject.apps.blog.views.entry['delete'], 'entry-delete' ]
	];
})();
