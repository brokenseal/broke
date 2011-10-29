(function(_){
	var
		utils= require('broke/core/utils')
		,Class= require('dependencies/pyjammin/class').Class
		,gettext= require('dependencies/gettext').gettext.gettext
	;

	Class.create({
		__name__: 'Field'
		,__parent__: _
		,widget: TextInput // Default widget to use when rendering this type of Field.
		,hiddenWidget: HiddenInput // Default widget to use when rendering this as "hidden".
		,defaultErrorMessages: {
			required: gettext('This field is required.')
			,invalid: gettext('Enter a valid value.')
		}
		,creationCounter: 0
		,__init__: function(kwargs){
			var
				defaultKwargs= {
					required: true
					,widget: null
					,label: null
					,initial: null
					,helpText: null
					,errorMessages: null
					,showHiddenInitial: false
					,validators: []
					,localize: false
				}
			;
			kwargs= utils.extend(defaultKwargs, (kwargs || {}));
			/*
			required -- Boolean that specifies whether the field is required.
			            True by default.
			widget -- A Widget class, or instance of a Widget class, that should
			          be used for this Field when displaying it. Each Field has a
			          default Widget that it'll use if you don't specify this. In
			          most cases, the default widget is TextInput.
			label -- A verbose name for this field, for use in displaying this
			         field in a form. By default, Django will use a "pretty"
			         version of the form field name, if the Field is part of a
			         Form.
			initial -- A value to use in this Field's initial display. This value
			           is *not* used as a fallback if data isn't given.
			help_text -- An optional string to use as "help text" for this Field.
			error_messages -- An optional dictionary to override the default
			                  messages that the field will raise.
			show_hidden_initial -- Boolean that specifies if it is needed to render a
			                       hidden widget with initial value after widget.
			validators -- List of addtional validators to use
			localize -- Boolean that specifies if the field should be localized.
			*/

			if(kwargs.label !== null) {
				// ???
				//kwargs.label= smartUnicode(kwargs.label);
			}

			// TODO
		}
		,validate: function(value){}
		,runValidators: function(value){}
		,clean: function(value){}
		,widgetAttrs: function(widget){}
		//,deepcopy: ???
	});

	_.Field.create({
		__name__: 'CharField'
		,__parent__: _
		,__init__: function(kwargs){
			this.maxLength= kwargs.maxLength || null;
			this.minLength= kwargs.minLength || null;

			this._super(kwargs);

			if(this.minLength) {
				this.validators.push(validators.MinLengthValidator(kwargs.minLength));
			}
			if(this.maxLength) {
				this.validators.push(validators.MaxLengthValidator(kwargs.maxLength));
			}
		}
		,widgetAttrs: function(value){}
	});
})(exports);
