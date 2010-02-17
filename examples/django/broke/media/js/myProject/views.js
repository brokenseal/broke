/*************************************************************************/
/******************************* VIEWS ***********************************/
/*************************************************************************/

(function(){
	var blog= myProject.apps.blog,
		Entry= blog.models.Entry,
		reverse= broke.urlResolvers.reverse,
		create= broke.shortcuts.node.create,
		update= broke.shortcuts.node.update;
	
	blog.views= {
		entry: {
			view: function(request, args){
				var response= {},
					id= args[0].asInt(),
					entry= Entry.objects.get({pk: id}),
					content= $('#content'),
					context= {
						entry: entry,
						entryEdit: reverse('entry-edit', [entry.pk]),
						entryDelete: reverse('entry-delete', [entry.pk])
					};
				
				content.empty();
				
				return create({
					htmlNode: content,
					template: blog.templates.entryView,
					context: context,
					callback: function(){
						var toolbar= $(this).find('.toolbar');
						
						toolbar.children('a.edit').button({
							icons: {primary: 'ui-icon-pencil'}
						});
						
						toolbar.children('a.delete').button({
							icons: {primary: 'ui-icon-trash'}
						})
					}
				});
			},
			popupView: function(request, args){
				var response= {},
					id= args[0].asInt(),
					entry= Entry.objects.get({pk: id}),
					modalDialog= entry.elements('.modal_dialog');
				
				if(!modalDialog.length) {
					response= create({
						template: blog.templates.entryView,
						context: { entry: entry },
						callback: function(){
							var modalDialog= this.dialog({
								width: 600,
								height: 200,
								title: entry.fields.title,
								close: function(){
									$(this).remove();
								}
							});
							modalDialog.css('top', '300px');
						}
					});
				}
				
				return response;
			},
			edit: function(request, args){
				var response= {},
					id= args[0].asInt(),
					entry= Entry.objects.get({pk: id}),
					element= entry.elements('li'),
					content= $('#content'),
					context= {
						entry: entry,
						entrySave: reverse('entry-save', [entry.pk]),
						entryView: reverse('entry-view', [entry.pk])
					};
				
				content.empty();
				
				return create({
					htmlNode: content,
					template: blog.templates.entryEdit,
					context: context,
					callback: function(){
						var _this= $(this);
						_this.find('button').button({
							icons: {primary: 'ui-icon-check'}
						}).end().find('input[name="pub_date"]').datepicker({
							dateFormat: broke.settings.dateFormat
						});
					}
				});
			},
			save: function(request, args){
				var response= {},
					id= args[0].asInt(),
					entry= Entry.objects.get({pk: id}),
					element= entry.elements('li')
					form= entry.elements('form'),
					content= $('#content');
				
				if(request.fromReload) {
					broke.log('Do not save if the event has been triggered by a window load event.');
					return response;
				}
				
				form.find('input,textarea').each(function(){
					var _this= $(this);
					
					entry.fields[_this.attr('name')]= _this.val();
				});
				
				entry.save();
				content.empty();
				
				return update({
					htmlNode: element,
					object: entry
				});
			},
			create: function(request, args){
				if(request.fromReload) {
					broke.log('Do not save if the event has been triggered by a window load event.');
					return {};
				}
				
				var response= {},
					form= $(request.event.target),
					newEntry= Entry.objects.create({
						model: 'blog.entry',
						fields: {
							title: form.find('input[name="title"]').val(),
							body: form.find('textarea[name="body"]').val(),
							pub_date: form.find('input[name="pub_date"]').val()
						}
					}),
					context= {
						entry: newEntry,
						entryView: reverse('entry-view', [newEntry.pk])
					};
				
				return create({
					htmlNode: newEntry.Class.elements('ul'),
					template: blog.templates.entryElement,
					context: context
				});
			},
			'delete': function(request, args){
				if(request.fromReload) {
					broke.log('Do not delete if the event has been triggered by a window load event.');
					return {};
				}
				
				var response= {},
					id= args[0].asInt(),
					entry= Entry.objects.get({pk: id}),
					element= entry.elements('li');
				
				entry['delete']();
				element.remove();
				$('#content').empty();
				return response;
			}
		}
	};
	
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
