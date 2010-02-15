(function(){
	var blog= myProject.apps.blog;
	
	blog.templates= {
		entryPopupView: '<div class="modal_dialog" rel="entry_{{ entry.pk }}">\
							<p>{{ entry.fields.body }}</p>\
						</div>',
		entryView: 		'<div rel="entry_{{ entry.pk }}">\
							<div class="toolbar">\
								<a href="#{{ entryEdit }}" class="edit">edit</a>\
								<a href="#{{ entryDelete }}" class="delete">delete</a>\
							</div>\
							<h3>{{ entry.fields.title }}</h3>\
							<h5>{{ entry.fields.pub_date }}</h5>\
							<p>{{ entry.fields.body|linebreaksbr }}</p>\
						</div>',
		entryEdit: 		'<form action="#{{ entrySave }}?next={{ entryView }}" rel="entry_{{ entry.pk }}">\
							<p>\
								<label for="title">Title</label>\
								<input type="text" name="title" value="{{ entry.fields.title }}" />\
							</p>\
							<p>\
								<label for="pub_date">Pub date</label>\
							<input type="text" name="pub_date" value="{{ entry.fields.pub_date }}" />\
							</p>\
							<p>\
								<label for="body">Body</label>\
								<textarea name="body">{{ entry.fields.body }}</textarea>\
							</p>\
							<button class="ui-state-default ui-corner-all">Save</button>\
						</form>',
		entryElement: 	'<li rel="entry_{{ entry.pk }}">\
							<a href="#{{ entryView }}" rel="title">{{ entry.fields.title }}</a>\
						</li>'
	};
})();
