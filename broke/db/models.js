(function(){
	var gettext= broke.i18n.gettext;
	
	/*************************************************************************/
	/******************************* MODEL ***********************************/
	/*************************************************************************/
	broke.Class.extend("broke.db.models.Model", {
		init: function(){
			this.objects= new broke.db.models.Manager(this);
			this.baseUrl= "/%s/%s/json/".echo(this.app_label, this.className.lower());
			
			// exceptions
			this.MultipleObjectsReturned= broke.exceptions.MultipleObjectsReturned;
			this.DoesNotExist= broke.exceptions.DoesNotExist;
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
	},{
		init: function(args, inheritedFields){
			broke.extend(this, args || {});
			
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
			
			var _this= this,
				className= _this.Class.className.lower(),
				operation= saveSettings.operation ? 'delete' : 'save',
				operationUrl= broke.conf.settings.JSON_URLS[operation].interpolate({
					model: className,
					appLabel: _this.Class.appLabel
				});
			
			// trigger model pre_save event
			$(window).trigger('broke.' + className + '.pre_' + operation, [this]);
			
			// load defaults on save settings
			saveSettings= broke.extend(clone(broke.conf.settings.SAVE), saveSettings);
			
			if(saveSettings.commit) {
				if(broke.conf.settings.USE_AJAX) {
					
					$.ajax({
						async: broke.conf.settings.AJAX.async,
						type: "POST",
						url: operationUrl,
						data: _this.fields,
						dataType: broke.conf.settings.AJAX.dataType,
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
							broke.extend(_this.dbReference, {
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
					var form= this.getForm();
					
					forEach(_this.fields, function(key){
						form.append($('<input type="hidden" name="' + key + '" value="' + this + '"/>'));
					});
					
					form.submit();
					// trigger model post_save event
					$(window).trigger('broke.' + className + '.post_' + operation, [this]);
				}
			} else {
				// storage update
				broke.extend(this.dbReference, {
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
	});
})();
