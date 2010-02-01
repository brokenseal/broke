/*************************************************************************/
/**************************** URL PATTERNS *******************************/
/*************************************************************************/

(function(){
	var blog= myProject.apps.blog,
		rss_reader= myProject.apps.rss_reader,
		patterns= broke.urlResolvers.patterns;
	
	blog.urlPatterns= patterns('myProject.apps.blog.views', [
		[ "entry/view/([0-9]+)/$", 'entry.view', 'view' ],
		[ "entry/edit/([0-9]+)/$", 'entry.edit', 'edit' ],
		[ "entry/save/([0-9]+)/$", 'entry.save', 'save' ],
		[ "entry/create/$", 'entry.create', 'create' ],
		[ "entry/delete/([0-9]+)/$", 'entry.delete', 'delete' ]
	]);
	
	myProject.urlPatterns= [
		[ "^/blog/", blog.urlPatterns, 'entry' ],
		[ "^/hide-address-bar/$", myProject.views.hideAddressBar ],
		[ "^/look-ma-no-hash/$", myProject.views.lookMaNoHash ],
		[ "^/commit/$", myProject.views.commit, 'commit' ]
	];
})();
