(function(_){
	var
		gettextLazy= require('broke/utils/translation').gettext.gettextLazy,
		GenericError= require('broke/core/exceptions').GenericError,
		validators= require('broke/core/validators'),
		Class= require('dependencies/pyjammin/class').Class,
		ansiDateRe,
		Field,
		TextField,
		CharField,
		DateField,
		IntegerField
	;
	
	/*************************************************************************/
	/************************** BASE FIELD CLASS *****************************/
	/*************************************************************************/
	Class.extend({
		__name__: "Field"
		,__parent__: _
		,emptyStringsAllowed: true
		,creationcounter: 0
		,autoCreationCounter: 0
		,defaultValidators: []
		,defaultErrorMessages: {
			'invalid_choice': gettextLazy('Value %s is not a valid choice.')
			,'null': gettextLazy('This field cannot be null.')
			,'blank': gettextLazy('This field cannot be blank.')
		}
		,__init__: function(kwargs){
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
	_.Field.extend({
		__name__: 'AutoField'
		,__parent__: _
		,description: gettextLazy('Integer')
		,emptyStringsAllowed: false
		,defaultErrorMessages: {
			'invalid': gettextLazy('This value must be an integer.')
		}
		,__init__: function(kwargs){
			if(kwargs['primaryKey'] === false) {
				// TODO: assert
				throw new GenericError(utils.interpolate(gettextLazy('"%ss must have primaryKey= true."'), this.Class.className));
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
			return parseInt(value, 10);
		},
		contributeToClass: function(cls, name){
			// TODO
		},
		formField: function(){
			return null;
		}
	});
	
	_.Field.extend({
		__name__: 'BooleanField'
		,__parent__: _
		,description: gettextLazy('Boolean (either true or false)')
		,emptyStringsAllowed: false
		,defaultErrorMessages: {
			'invalid': gettextLazy('This value must be either true or false.')
		}
		,__init__: function(kwargs){
			kwargs.blank= true;
			
			if(!('default' in kwargs) && !kwargs['null']) {
				kwargs['default']= false;
			}
			
			this._super(kwargs);
		},
		getPrepLookup: function(lookupType, value){
			if(utils.has(['1', '0'], value)) {
				value= new Boolean(parseInt(value, 10));
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
	
	_.Field.extend({
		__name__: 'CharField'
		,__parent__: _
		,description: gettextLazy("String (up to %(max_length)s)")
		,__init__: function(kwargs){
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
	
	_.Field.extend({
		__name__: 'CommaSeparatedIntegerField'
		,__parent__: _
		,description : gettextLazy("Comma separated integers.")
		,defaultValidators: [
			validators.validateCommaSeparatedIntegerList
		]
		,__init__: function(kwargs){
			this._super(kwargs);
		},
		formField: function(kwargs){
			broke.extend(kwargs, {
				errorMessages: {
					'invalid': gettextLazy('Enter only digits separated by commas.')
				}
			});
			
			this._super(kwargs);
		}
	});
	
	ansiDateRe= new RegExp('^\d{4}-\d{1,2}-\d{1,2}$');
	
	_.Field.extend({
		__name__: 'DateField'
		,__parent__: _
		,description: gettextLazy('Date (without time)')
		,emptyStringsAllowed: false
		,defaultErrorMessages: {
			'invalid': gettextLazy('Enter a valid date in YYYY-MM-DD format.')
			,'invalid_date': gettextLazy('Invalid date: %s')
		}
		,__init__: function(kwargs){
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
	
	_.Field.extend({
		__name__: 'DateTimeField'
		,__parent__: _
		,description : gettextLazy("Date (with time).")
		,defaultErrorMessages: {
			'invalid': gettextLazy('Enter a valid date/time in YYYY-MM-DD HH:MM[:ss[.uuuuuu]] format.')
		}
		,__init__: function(kwargs){
			this._super(kwargs);
		}
	});
	
	_.Field.extend({
		__name__: 'DecimalField'
		,__parent__: _
		,description: gettextLazy('Decimal number')
		,emptyStringsAllowed: false
		,defaultErrorMessages: {
			'invalid': gettextLazy('This value must be a decimal number.')
		}
		,__init__: function(kwargs){
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
	
	_.Field.extend({
		__name__: 'EmailField'
		,__parent__: _
		,description: gettextLazy('E-mail address')
		,defaultValidators: [ validators.validateEmail ]
		,__init__: function(kwargs){
			kwargs.maxLength= kwargs.maxLength || 75;
			this._super(kwargs);
		}
	});
	
	_.Field.extend({
		__name__: 'FilePathField'
		,__parent__: _
		,description: gettextLazy('File path')
		,__init__: function(kwargs){
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
	
	_.Field.extend({
		__name: 'FloatField'
		,__parent__: _
		,description: gettextLazy('Floating point number')
		,emptyStringsAllowed: false
		,defaultErrorMessages: {
			'invalid': gettextLazy("This value must be a float.")
		}
		,__init__: function(kwargs){
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
	
	_.Field.extend({
		__name__: 'IntegerField'
		,__parent__: _
		,description: gettextLazy('Integer')
		,defaultErrorMessages: {
			'invalid': gettextLazy('This value must be an integer.')
		}
		,__init__: function(kwargs){
			this._super(kwargs);
		}
	});
	
	_.Field.extend({
		__name__: 'BigIntegerField'
		,__parent__: _
		,__init__: function(kwargs){
			this._super(kwargs);
		}
	});
	
	_.Field.extend({
		__name__: 'IPAddressField'
		,__parent__: _
		,__init__: function(kwargs){
			this._super(kwargs);
		}
	});
	
	_.Field.extend({
		__name__: 'NullBooleanField'
		,__parent__: _
		,__init__: function(kwargs){
			this._super(kwargs);
		}
	});
	
	_.Field.extend({
		__name__: 'PositiveIntegerField'
		,__parent__: _
		,__init__: function(kwargs){
			this._super(kwargs);
		}
	});
	
	_.Field.extend({
		__name__: 'PositiveSmallIntegerField'
		,__parent__: _
		,__init__: function(kwargs){
			this._super(kwargs);
		}
	});
	
	_.Field.extend({
		__name__: 'SlugField'
		,__parent__: _
		,__init__: function(kwargs){
			this._super(kwargs);
		}
	});
	
	_.Field.extend({
		__name__: 'SmallIntegerField'
		,__parent__: _
		,__init__: function(kwargs){
			this._super(kwargs);
		}
	});
	
	_.Field.extend({
		__name__: 'TextField'
		,__parent__: _
		,__init__: function(kwargs){
			this._super(kwargs);
		}
	});
	
	_.Field.extend({
		__name__: 'TimeField'
		,__parent__: _
		,__init__: function(kwargs){
			this._super(kwargs);
		}
	});
	
	_.Field.extend({
		__name__: 'URLField'
		,__parent__: _
		,__init__: function(kwargs){
			this._super(kwargs);
		}
	});
	
	_.Field.extend({
		__name__: 'XMLField'
		,__parent__: _
		,__init__: function(kwargs){
			this._super(kwargs);
		}
	});
})(exports);
