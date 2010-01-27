/*************************************************************************/
/***************************** TEMPLATES *********************************/
/*************************************************************************/

broke.extend(broke.templates, {
	addressBar: '<div id="address_bar" style="position:fixed;\
						top:-10px;\
						right:20px;\
						border:1px solid red;\
						border-top:0;\
						padding:20px;\
						background:#ff7209;\
						display:none;\
						z-index:999;\
						-moz-border-radius:10px;\">\
					<a href="#" style="position:absolute;top:10px;right:20px;">[Hide]</a>\
					<form action="." method="post" style="padding:0;">\
						<p>\
							<label for="url">Url: </label>\
							<input type="text" name="url" size="60" value=""/>\
						</p>\
					</form>\
				</div>'
});
