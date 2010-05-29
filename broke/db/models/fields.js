(function(_){
	var
		gettextLazy= require('broke/utils/translation').gettextLazy,
		GenericError= require('broke/core/exceptions').GenericError,
		validators= require('broke/core/validators'),
		Class= require('dependencies/class').Class,
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
		meta: {
			name: "Field",
			parent: _
		},
		klass: {
			init: function(){},
			emptyStringsAllowed: true,
			creationcounter: 0,
			autoCreationCounter: 0,
			defaultValidators: [],
			defaultErrorMessages: {
				'invalid_choice': gettextLazy('Value %s is not a valid choice.'),
				'null': gettextLazy('This field cannot be null.'),
				'blank': gettextLazy('This field cannot be blank.')
			}
		},
		prototype: {
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
				return this.Class.name;
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
		}
	});
	
	// AutoField
	_.Field.extend({
		meta: {
			name: 'AutoField',
			parent: _
		},
		klass: {
			description: gettextLazy('Integer'),
			emptyStringsAllowed: false,
			defaultErrorMessages: {
				'invalid': gettextLazy('This value must be an integer.')
			}
		},
		prototype: {
			init: function(kwargs){
				if(kwargs['primaryKey'] === false) {
					// TODO: assert
					throw GenericError(gettextLazy('"%ss must have primaryKey= true."').echo(this.Class.name));
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
		}
	});
	
	_.Field.extend({
		meta: {
			name: 'BooleanField',
			parent: _
		},
		klass: {
			description: gettextLazy('Boolean (either true or false)'),
			emptyStringsAllowed: false,
			defaultErrorMessages: {
				'invalid': gettextLazy('This value must be either true or false.')
			}
		},
		prototype: {
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
		}
	});
	
	_.Field.extend({
		meta: {
			name: 'CharField',
			parent: _
		},
		klass: {
		    description : gettextLazy("String (up to %(max_length)s)")
		},
		prototype: {
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
		}
	});
	
	_.Field.extend({
		meta: {
			name: 'CommaSeparatedIntegerField',
			parent: _
		},
		klass: {
			description : gettextLazy("Comma separated integers."),
			defaultValidators: [
				validators.validateCommaSeparatedIntegerList
			]
		},
		prototype: {
			init: function(kwargs){
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
		}
	});
	
	ansiDateRe= new RegExp('^\d{4}-\d{1,2}-\d{1,2}$');
	
	_.Field.extend({
		meta: {
			name: 'DateField',
			parent: _
		},
		klass: {
			description: gettextLazy('Date (without time)'),
			emptyStringsAllowed: false,
			defaultErrorMessages: {
				'invalid': gettextLazy('Enter a valid date in YYYY-MM-DD format.'),
				'invalid_date': gettextLazy('Invalid date: %s')
			}
		},
		prototype: {
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
		}
	});
	
	_.Field.extend({
		meta: {
			name: 'DateTimeField',
			parent: _
		},
		klass: {
			description : gettextLazy("Date (with time)."),
			defaultErrorMessages: {
				'invalid': gettextLazy('Enter a valid date/time in YYYY-MM-DD HH:MM[:ss[.uuuuuu]] format.')
			}
		},
		prototype: {
			init: function(kwargs){
				this._super(kwargs);
			}
		}
	});
	
	_.Field.extend({
		meta: {
			name: 'DecimalField',
			parent: _
		},
		klass: {
			description: gettextLazy('Decimal number'),
			emptyStringsAllowed: false,
			defaultErrorMessages: {
				'invalid': gettextLazy('This value must be a decimal number.')
			}
		},
		prototype: {
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
		}
	});
	
	_.Field.extend({
		meta: {
			name: 'EmailField',
			parent: _
		},
		klass: {
			description: gettextLazy('E-mail address'),
			defaultValidators: [ validators.validateEmail ]
		},
		prototype: {
			init: function(kwargs){
				kwargs.maxLength= kwargs.maxLength || 75;
				this._super(kwargs);
			}
		}
	});
	
	_.Field.extend({
		meta: {
			name: 'FilePathField',
			parent: _
		},
		klass: {
			description: gettextLazy('File path')
		},
		prototype: {
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
		}
	});
	
	_.Field.extend({
		meta: {
			name: 'FloatField',
			parent: _
		},
		klass: {
			description: gettextLazy('Floating point number'),
			emptyStringsAllowed: false,
			defaultErrorMessages: {
				'invalid': gettextLazy("This value must be a float.")
			}
		},
		prototype: {
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
		}
	});
	
	_.Field.extend({
		meta: {
			name: 'IntegerField',
			parent: _
		},
		klass: {
			description: gettextLazy('Integer'),
			defaultErrorMessages: {
				'invalid': gettextLazy('This value must be an integer.')
			}
		},
		prototype: {
			init: function(kwargs){
				this._super(kwargs);
			}
		}
	});
	
	_.Field.extend({
		meta: {
			name: 'BigIntegerField',
			parent: _
		},
		prototype: {
			init: function(kwargs){
				this._super(kwargs);
			}
		}
	});
	
	_.Field.extend({
		meta: {
			name: 'IPAddressField',
			parent: _
		},
		prototype: {
			init: function(kwargs){
				this._super(kwargs);
			}
		}
	});
	
	_.Field.extend({
		meta: {
			name: 'NullBooleanField',
			parent: _
		},
		prototype: {
			init: function(kwargs){
				this._super(kwargs);
			}
		}
	});
	
	_.Field.extend({
		meta: {
			name: 'PositiveIntegerField',
			parent: _
		},
		prototype: {
			init: function(kwargs){
				this._super(kwargs);
			}
		}
	});
	
	_.Field.extend({
		meta: {
			name: 'PositiveSmallIntegerField',
			parent: _
		},
		prototype: {
			init: function(kwargs){
				this._super(kwargs);
			}
		}
	});
	
	_.Field.extend({
		meta: {
			name: 'SlugField',
			parent: _
		},
		prototype: {
			init: function(kwargs){
				this._super(kwargs);
			}
		}
	});
	
	_.Field.extend({
		meta: {
			name: 'SmallIntegerField',
			parent: _
		},
		prototype: {
			init: function(kwargs){
				this._super(kwargs);
			}
		}
	});
	
	_.Field.extend({
		meta: {
			name: 'TextField',
			parent: _
		},
		prototype: {
			init: function(kwargs){
				this._super(kwargs);
			}
		}
	});
	
	_.Field.extend({
		meta: {
			name: 'TimeField',
			parent: _
		},
		prototype: {
			init: function(kwargs){
				this._super(kwargs);
			}
		}
	});
	
	_.Field.extend({
		meta: {
			name: 'URLField',
			parent: _
		},
		prototype: {
			init: function(kwargs){
				this._super(kwargs);
			}
		}
	});
	
	_.Field.extend({
		meta: {
			name: 'XMLField',
			parent: _
		},
		prototype: {
			init: function(kwargs){
				this._super(kwargs);
			}
		}
	});
})(exports);
