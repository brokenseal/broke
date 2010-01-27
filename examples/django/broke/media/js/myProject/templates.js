(function(){
	var blog= myProject.apps.blog;
	
	blog.templates= {
		entryView: 	'<div class="modal_dialog" rel="entry_{{ entry.pk }}">\
						<p>{{ entry.fields.body }}</p>\
					</div>',
		entryRow: 	'<tr rel="entry_{{ entry.pk }}">\
						<td rel="title">\
							{{ entry.fields.title }}\
						</td>\
						<td rel="body">\
							{{ entry.fields.body }}\
						</td>\
						<td rel="pub_date">\
							{{ entry.fields.pub_date }}\
						</td>\
						<td>\
							<a href="#{{ entryView }}">View</a>\
							<a href="#{{ entryEdit }}">Edit</a>\
							<a href="#{{ entryDelete }}">Delete</a>\
						</td>\
					</tr>'
	};
})();
