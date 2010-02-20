/*************************************************************************/
/******************************* VIEWS ***********************************/
/*************************************************************************/

(function(){
	myProject.views= {
		lookMaNoHash: function(request, args){
			alert("look ma, no hash!!");
			
			request.event.preventDefault();
			return {};
		},
		hideAddressBar: function(){
			$('#address_bar').slideUp();
		},
		commit: function(){
			alert('Commit!');
		}
	};
})();
