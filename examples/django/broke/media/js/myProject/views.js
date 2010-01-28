/*************************************************************************/
/******************************* VIEWS ***********************************/
/*************************************************************************/

(function(){
	var blog= myProject.apps.blog,
		Entry= blog.models.Entry,
		reverse= broke.urlResolvers.reverse;
	
	blog.views= {
		entry: {
			view: function(request, args){
				var response= {},
					id= args[0].asInt(),
					entry= Entry.objects.get({pk: id}),
					modalDialog= entry.elements('.modal_dialog');
				
				if(!modalDialog.length) {
					response= {
						operation: 'create',
						template: blog.templates.entryView,
						context: {
							entry: entry
						},
						additionalMethods: {
							dialog: function(){
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
						}
					};
				}
				
				return response;
			},
			edit: function(request, args){
				var response= {},
					id= args[0].asInt(),
					entry= Entry.objects.get({pk: id}),
					saveLink= '<a href="#%s?next=%s">Save</a>'.echo(reverse('entry-save', [id]), reverse('entry-view', [id]));
					row= entry.elements('tr');
				
				row.find('td:not(:last)').each(function(){
					var value= $(this).text().trim();
					$(this).text('');
					$('<input type="text" name="boh" value="' + value + '"/>').appendTo($(this));
				});
				
				row.find('td:last a').hide();
				row.find('td:last').append($(saveLink));
				
				return response;
			},
			save: function(request, args){
				var response= {},
					id= args[0].asInt(),
					entry= Entry.objects.get({pk: id}),
					row= entry.elements('tr'),
					target;
				
				if(request.fromReload) {
					broke.log('Do not save if the event has been triggered by a window load event.');
					return response;
				}
				
				if(request.event.target.localName) {
					target= request.event.target.localName.lower();
					
					if(target === 'form') {
						request.event.preventDefault();
					}
				}
				
				// update the entry
				row.find('td').each(function(){
					var value= $(this).find('input').val();
					
					if(value) {
						entry.fields[$(this).attr('rel')]= value.trim();
					}
				});
				
				entry.save();
				
				return {
					operation: 'update',
					htmlNode: row,
					object: entry,
					additionalMethods: {
						links: function(){
							this.find('td:last a:visible').remove();
							this.find('td:last a:hidden').show();
						}
					}
				};
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
					});
				
				return {
					operation: 'create',
					htmlNode: newEntry.Class.elements('table'),
					template: blog.templates.entryRow,
					context: {
						entry: newEntry,
						entryView: reverse('entry-view', [newEntry.pk]),
						entryEdit: reverse('entry-edit', [newEntry.pk]),
						entryDelete: reverse('entry-delete', [newEntry.pk])
					}
				};
			},
			'delete': function(request, args){
				if(request.fromReload) {
					broke.log('Do not delete if the event has been triggered by a window load event.');
					return {};
				}
				
				var response= {},
					id= args[0].asInt(),
					entry= Entry.objects.get({pk: id}),
					row= entry.elements('tr');
				
				entry['delete']();
				row.remove();
				
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
