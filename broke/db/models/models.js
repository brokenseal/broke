(function(_){
	var
		Class= require('dependencies/class').Class,
		gettext= require('broke/utils/translation').gettext,
		Manager= require('broke/db/models/manager').Manager,
		exceptions= require('broke/core/exceptions'),
		extend= require('broke/core/utils').extend,
		settings= require('broke/conf/settings')
	;
	
	/*************************************************************************/
	/******************************* MODEL ***********************************/
	/*************************************************************************/
	Class.extend({
		meta: {
			name: 'Model',
			parent: _
		},
		klass: {
			init: function(){
				this.objects= new Manager(this);
				this.baseUrl= "/%s/%s/json/".echo(this.app_label, this.className.lower());
				
				// exceptions
				this.MultipleObjectsReturned= exceptions.MultipleObjectsReturned;
				this.DoesNotExist= exceptions.DoesNotExist;
			},
			autoInit: false,
			elements: function(args){
				// element identifier : e.g. entry_list
				var elementIdentifier= this.className.lower(),
					elements= $('[rel~="' + elementIdentifier + '"]');
				
				if(args) {
					elements= elements.filter(args);
				}
				
				return elements;
			}
		},
		prototype: {
			init: function(args, inheritedFields){
				extend(this, args || {});
				
				// provides primary key access inside the fields
				// is there a better way?
				if(this.fields.pk === undefined){
					this.fields.pk= this.pk;
				}
				
				this.dbReference= args;
			},
			getSlug: function(field){
				return (field || this.fields.title || '').slugify();
			},
			elements: function(args){
				// element identifier : e.g. entry_21
				var elementIdentifier= this.Class.className.lower() + '_' + this.pk,
					elements= $('[rel~="' + elementIdentifier + '"]');
				
				if(args) {
					elements= elements.filter(args);
				}
				
				return elements;
			},
			getForm: function(){
				if(!this.form) {
					var form= this.elements('form');
					
					if(form.length) {
						this.form= form;
					} else {
						this.form= $('<form enctype="multipart/form-data" action="." method="post" style="display:none;" class="PSIXForm">');
						$('body').append(this.form);
					}
				}
				return this.form;
			},
			getAbsoluteUrl: function(){
				return '';
			},
			getOperation: function(del){
				if(del !== undefined && this.fields.pk) {
					return 'delete';
				}
				else if(this.fields.pk) {
					return 'update';
				}
				
				return 'create';
			},
			save: function(saveSettings){
				saveSettings= saveSettings || {};
				
				var
					_this= this,
					className= _this.Class.className.lower(),
					operation= saveSettings.operation ? 'delete' : 'save',
					operationUrl= settings.JSON_URLS[operation].interpolate({
						model: className,
						appLabel: _this.Class.appLabel
					})
				;
				
				// trigger model pre_save event
				$(window).trigger('broke.' + className + '.pre_' + operation, [this]);
				
				// load defaults on save settings
				saveSettings= extend(clone(settings.SAVE), saveSettings);
				
				if(saveSettings.commit) {
					if(settings.USE_AJAX) {
						
						$.ajax({
							async: settings.AJAX.async,
							type: "POST",
							url: operationUrl,
							data: _this.fields,
							dataType: settings.AJAX.dataType,
							error: function(xhr, status, error){
								status= status;
							},
							success: function(data, status){
								if(saveSettings['delete']) {
									status= status;
									return;
								}
								_this.pk= data.pk;
								_this.model= data.model;
								_this.fields.id= _this.pk;
								
								// storage update
								extend(_this.dbReference, {
									pk: _this.pk,
									model: _this.model,
									fields: _this.fields
								});
								
								status= status;
							},
							complete: function(){
								// trigger model post_save event
								$(window).trigger('broke.' + className + '.post_' + operation, [this]);
							}
						});
					} else {
						var
							form= this.getForm()
						;
						
						forEach(_this.fields, function(key){
							form.append($('<input type="hidden" name="' + key + '" value="' + this + '"/>'));
						});
						
						form.submit();
						// trigger model post_save event
						$(window).trigger('broke.' + className + '.post_' + operation, [this]);
					}
				} else {
					// storage update
					extend(this.dbReference, {
						pk: this.pk,
						model: this.model,
						fields: this.fields
					});
				}
				
				return _this;
			},
			'delete': function(settings){
				settings= settings || {};
				settings.operation= 'delete';
				return this.save(settings);
			}
		}
	});
})(exports);
