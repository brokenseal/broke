(function(){
	broke.extend({
		utils: {
			html: {
				escape: function(html){
					return html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#39;').replace(/"/g, '&quot;');
				}
			}
		}
	});
})();
