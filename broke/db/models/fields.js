(function(__global__){
	var broke= __global__.broke,
		gettext= broke.utils.translation.gettextLazy,
		module= "broke.db.models.fields.",
		GenericError= broke.core.exceptions.GenericError,
		validators= broke.core.validators,
		Class= broke.Class,
		ansiDateRe,
		Field,
		TextField,
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
			
			this.validators= this.validators.concat(this.Class.defaultValidators);
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
		description: gettextLazy('Integer'),
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
		contributeToClass: function(cls, name){
			// TODO
		},
		formField: function(){
			return null;
		}
	});
	
	Field.extend(module + "BooleanField", {
		description: gettextLazy('Boolean (either true or false)'),
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
		formField: function(){
			// TODO
		}
	});
	
	CharField= Field.extend(module + "CharField", {
	    description : gettextLazy("String (up to %(max_length)s)")
	}, {
		init: function(kwargs){
			this._super(kwargs);
			
			this.validators.push(validators.MaxLengthValidator(this.maxLength));
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
	    description : gettextLazy("Comma separated integers."),
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
		description: gettextLazy('Date (without time)'),
		emptyStringsAllowed: false,
		defaultErrorMessages: {
			'invalid': gettextLazy('Enter a valid date in YYYY-MM-DD format.'),
			'invalid_date': gettextLazy('Invalid date: %s')
		}
	},{
		init: function(kwargs){
			this.autoNow= kwargs.autoNow;
			this.autoNowAdd= kwargs.autoNowAdd;
			
			if(kwargs.autoNow || kwargs.autoNowAdd) {
				kwargs.editable= false;
				kwargs.blank= true;
			}
			
			this._super(kwargs);
		},
		preSave: function(){
			// TODO
		},
		contributeToClass: function(){
			// TODO
		},
		getPrepLookup: function(){
			// TODO
		},
		getPrepValue: function(){
			// TODO
		},
		getDbPrepValue: function(){
			// TODO
		},
		valueToString: function(){
			// TODO
		},
		formField: function(){
			// TODO
		}
	});
	
	DateField.extend(module + "DateTimeField", {
	    description : gettextLazy("Date (with time)."),
		defaultErrorMessages: {
			'invalid': gettextLazy('Enter a valid date/time in YYYY-MM-DD HH:MM[:ss[.uuuuuu]] format.')
		}
	},{
		init: function(kwargs){
			this._super(kwargs);
		}
	});
	
	Field.extend(module + "DecimalField", {
		description: gettextLazy('Decimal number'),
		emptyStringsAllowed: false,
		defaultErrorMessages: {
	        'invalid': gettextLazy('This value must be a decimal number.')
		}
	},{
		init: function(kwargs){
	        this.maxDigits= kwargs.maxDigits;
			this.decimalPlaces= kwargs.decimalPlaces;
			
			this._super(kwargs);
		},
		getInternalType: function(){
			// TODO
		},
		_format: function(){
			// TODO
		},
		formatNumber: function(){
			// TODO
		},
		getDbPrepSave: function(){
			// TODO
		},
		getPrepValue: function(){
			// TODO
		},
		formField: function(){
			// TODO
		}
	});
	
	CharField.extend(module + "EmailField", {
		description: gettextLazy('E-mail address'),
		defaultValidators: [ validators.validateEmail ]
	},{
		init: function(kwargs){
			kwargs.maxLength= kwargs.maxLength || 75;
			this._super(kwargs);
		}
	});
	
	Field.extend(module + "FilePathField", {
		description: gettextLazy('File path')
	},{
		init: function(kwargs){
			this.path= kwargs.path;
			this.match= kwargs.match;
			this.recursive= kwargs.recursive;
			
			kwargs.maxLength= kwargs.maxLength ||100;
			this._super(kwargs);
		},
		formField: function(){
			// TODO
		}
	});
	
	Field.extend(module + "FloatField", {
		description: gettextLazy('Floating point number'),
		emptyStringsAllowed: false,
		defaultErrorMessages: {
			'invalid': gettextLazy("This value must be a float.")
		}
	},{
		init: function(kwargs){
			this._super(kwargs);
		},
		getPrepValue: function(){
			// TODO
		},
		getInternalType: function(){
			// TODO
		},
		formField: function(){
			// TODO
		}
	});
	
	IntegerField= Field.extend(module + "IntegerField", {
		description: gettextLazy('Integer'),
		defaultErrorMessages: {
			'invalid': gettextLazy('This value must be an integer.')
		}
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
	
	TextField= Field.extend(module + "TextField", {
		
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
})(this);
