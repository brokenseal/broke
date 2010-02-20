/*************************************************************************/
/**************************** URL PATTERNS *******************************/
/*************************************************************************/

(function(){
	myProject.urlPatterns= [
		[ "^/blog/", 'myProject.apps.blog.urlPatterns', 'entry' ],
		[ "^/gettext_test/", 'myProject.apps.gettext_test.urlPatterns', 'gettext_test' ],
		[ "^/rss_reader/", 'myProject.apps.rss_reader.urlPatterns', 'rss_reader' ],
		[ "^/hide-address-bar/$", myProject.views.hideAddressBar ],
		[ "^/look-ma-no-hash/$", myProject.views.lookMaNoHash ],
		[ "^/commit/$", myProject.views.commit, 'commit' ]
	];
})();
