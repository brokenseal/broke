(function(){
	var gettext= broke.utils.translation.gettextLazy,
		module= "broke.db.models.fields",
		GenericError= broke.exceptions.GenericError,
		validators= broke.core.validators,
		Class= broke.Class,
		ansiDateRe,
		Field,
		CharField,
		DateField,
		IntegerField;
	
	/*************************************************************************/
	/************************** BASE FIELD CLASS *****************************/
	/*************************************************************************/
	Field= Class.extend(module + "Field", {
		init: function(){},
		emptyStringsAllowed: true,
		creationcounter: 0,
		autoCreationCounter: 0,
		defaultValidators: [],
		defaultErrorMessages: {
			'invalid_choice': gettext('Value %s is not a valid choice.'),
			'null': gettext('This field cannot be null.'),
			'blank': gettext('This field cannot be blank.')
		}
	},{
		init: function(kwargs){
			
			// default values
			broke.extend(kwargs, {
				verboseName: null,
				name: null,
				primaryKey: false,
				maxLength: null,
				unique: false,
				blank: false,
				'null': false,
				dbIndex: false,
				rel: null,
				'default': null,
				editable: true,
				serialize: true,
				uniqueForDate: null,
				uniqueForMonth: null,
				uniqueForYear: null,
				choices: null,
				helpText: '',
				dbColumn: null,
				dbTableSpace: null,
				autoCreated: false,
				validators: [],
				errorMessages: null
			});
			
			// extend this with the kwargs provided
			broke.extend(this, kwargs);
			
			if(this.autoCreated) {
				this.Class.autoCreationCounter-= 1;
			} else {
				this.Class.creationCounter+= 1;
			}
			
			this.validators= this.validators.populate(this.Class.defaultValidators);
			broke.extend(this.errorMessages, this.defaultErrorMessages);
		},
		runValidators: function(){},
		validate: function(){},
		clean: function(){},
		dbType: function(){},
		unique: function(){},
		setAttributesFormName: function(){},
		getAttName: function(){},
		getAttNameColumn: function(){},
		getCacheName: function(){},
		preSave: function(){},
		getInternalType: function(){
			return this.Class.className;
		},
		getPrepValue: function(){},
		getDbPrepValue: function(){},
		getDbPrepSave: function(){},
		getPrepLookup: function(){},
		getDbPrepLookup: function(){},
		getValidatorUniqueLookupType: function(){},
		getChoices: function(){},
		getChoicesDefault: function(){},
		getFlatChoices: function(){},
		_getValFromObj: function(){},
		valueToString: function(){},
		bind: function(){},
		_getChoices: function(){},
		_getFlatChoices: function(){},
		saveFormData: function(){},
		formField: function(){},
		valueFromObject: function(){}
	});
	
	// AutoField
	Field.extend(module + "AutoField", {
		emptyStringsAllowed: false,
		defaultErrorMessages: {
			'invalid': gettext('This value must be an integer.')
		}
	},{
		init: function(kwargs){
			if(kwargs['primaryKey'] === false) {
				// TODO: assert
				throw GenericError(gettext('"%ss must have primaryKey= true."').echo(this.Class.className));
			}
			kwargs.blank= true;
			
			this._super(kwargs);
		},
		validate: function(value, modelInstance){
			return;
		},
		getPrepValue: function(value){
			if(value === null) {
				return null;
			}
			return value.asInt();
		},
		contributeToClass: function(cls, name){},
		formField: function(){
			return null;
		}
	});
	
	Field.extend(module + "BooleanField", {
		emptyStringsAllowed: false,
		defaultErrorMessages: {
			'invalid': gettext('This value must be either true or false.')
		}
	},{
		init: function(kwargs){
			kwargs.blank= true;
			
			if(!('default' in kwargs) && !kwargs['null']) {
				kwargs['default']= false;
			}
			
			this._super(kwargs);
		},
		getInternalType: function(){
			return this.Class.className;
		},
		getPrepLookup: function(lookupType, value){
			if(['1', '0'].has(value)) {
				value= new Boolean(value.asInt());
			}
			
			return this._super(lookupType, value);
		},
		getPrepValue: function(value){
			if(value === null) {
				return null;
			}
			return new Boolean(value);
		},
		validate: function(value, modelInstance){
			return;
		},
		formField: function(){}
	});
	
	CharField= Field.extend(module + "CharField", {
		init: function(kwargs){
			this._super(kwargs);
			
			this.validators.push(validators.MaxLengthValidator(this.maxLength));
		},
		getInternalType: function(){
			return this.Class.className;
		},
		getPrepValue: function(value){
			return value;
		},
		formField: function(kwargs){
			broke.extend(kwargs, {
				maxLength: this.maxLength
			});
			
			this._super(kwargs);
		}
	});
	
	CharField.extend(module + "CommaSeparatedIntegerField", {
		defaultValidators: [
			validators.validateCommaSeparatedIntegerList
		]
	},{
		init: function(kwargs){
			this._super(kwargs);
		},
		formField: function(kwargs){
			broke.extend(kwargs, {
				errorMessages: {
					'invalid': gettext('Enter only digits separated by commas.')
				}
			});
			
			this._super(kwargs);
		}
	});
	
	ansiDateRe= new RegExp('^\d{4}-\d{1,2}-\d{1,2}$');
	
	DateField= Field.extend(module + "DateField", {
		
	},{
		init: function(kwargs){
			this._super(kwargs);
		}
	});
	
	DateField.extend(module + "DateTimeField", {
		
	},{
		init: function(kwargs){
			this._super(kwargs);
		}
	});
	
	Field.extend(module + "DecimalField", {
		
	},{
		init: function(kwargs){
			this._super(kwargs);
		}
	});
	
	CharField.extend(module + "EmailField", {
		
	},{
		init: function(kwargs){
			this._super(kwargs);
		}
	});
	
	Field.extend(module + "FilePathField", {
		
	},{
		init: function(kwargs){
			this._super(kwargs);
		}
	});
	
	Field.extend(module + "FloatField", {
		
	},{
		init: function(kwargs){
			this._super(kwargs);
		}
	});
	
	IntegerField= Field.extend(module + "IntegerField", {
		
	},{
		init: function(kwargs){
			this._super(kwargs);
		}
	});
	
	Field.extend(module + "BigIntegerField", {
		
	},{
		init: function(kwargs){
			this._super(kwargs);
		}
	});
	
	Field.extend(module + "IPAddressField", {
		
	},{
		init: function(kwargs){
			this._super(kwargs);
		}
	});
	
	Field.extend(module + "NullBooleanField", {
		
	},{
		init: function(kwargs){
			this._super(kwargs);
		}
	});
	
	IntegerField.extend(module + "PositiveIntegerField", {
		
	},{
		init: function(kwargs){
			this._super(kwargs);
		}
	});
	
	IntegerField.extend(module + "PositiveSmallIntegerField", {
		
	},{
		init: function(kwargs){
			this._super(kwargs);
		}
	});
	
	CharField.extend(module + "SlugField", {
		
	},{
		init: function(kwargs){
			this._super(kwargs);
		}
	});
	
	IntegerField.extend(module + "SmallIntegerField", {
		
	},{
		init: function(kwargs){
			this._super(kwargs);
		}
	});
	
	Field.extend(module + "TextField", {
		
	},{
		init: function(kwargs){
			this._super(kwargs);
		}
	});
	
	Field.extend(module + "TimeField", {
		
	},{
		init: function(kwargs){
			this._super(kwargs);
		}
	});
	
	CharField.extend(module + "URLField", {
		
	},{
		init: function(kwargs){
			this._super(kwargs);
		}
	});
	
	TextField.extend(module + "XMLField", {
		
	},{
		init: function(kwargs){
			this._super(kwargs);
		}
	});
});
