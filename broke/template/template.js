/* 
 * Django template engine based on the porting made by xiaocong.hust and John.Sec.Huang
 * http://code.google.com/p/jtl-javascript-template/
 * MIT Licensed
 * 
 */

(function(_){
	var
		Class= require('dependencies/class').Class,
		utils= require('broke/core/utils'),
		__module__= {
			// constants
			TOKEN_TEXT: 0,
			TOKEN_VAR: 1,
			TOKEN_BLOCK: 2,
			TOKEN_COMMENT: 3,
			
			// template syntax constants
			FILTER_SEPARATOR: '|',
			FILTER_ARGUMENT_SEPARATOR: ':',
			VARIABLE_ATTRIBUTE_SEPARATOR: '.',
			BLOCK_TAG_START: '{%',
			BLOCK_TAG_END: '%}',
			VARIABLE_TAG_START: '{{',
			VARIABLE_TAG_END: '}}',
			COMMENT_BLOCK_TAG_START: '{#',
			COMMENT_TAG_END: '#}',
			SINGLE_BRACE_START: '{',
			SINGLE_BRACE_END: '}',
			
			tagList: {},
			filterList: {},
			register: {
				tag: function(tagName, fn) {
					broke.template.tagList[tagName]= fn;
				},
				filter: function(filterName, fn) {
					broke.template.filterList[filterName]= fn;
				}
			}
		}
	;
	
	Class.extend({
		meta: {
			name: 'Template',
			parent: _
		},
		klass: {
			listRender: function(context, nodelist) {
				var result= [];
				
				//nodelist.each(function(){
				utils.forEach(nodelist, function(){
					result.push(this.render(context));
				});
				
				return result.join('');	
			},
			getVar: function(context, varstr) {
				return utils.getattr(varstr, context);
			}
		},
		prototype: {
			init: function(tpl){
				this._nodelist = this._compile(tpl);
			},
			_compile: function(tpl){
				var tokens,
					tagStr= this._formRegx(),
					tagRe= new RegExp(tagStr, 'g'),
					bits= [],
					originalBits= tpl.bsplit(tagRe);
				
				//originalBits.each(function(){
				utils.forEach(originalBits, function(){
					if(this != "") {
						bits.push(this);
					}
				});
				
				// create token
				tokens= utils.map(bits, function(){
					var tagToken;
					
					if(this.startsWith(template.BLOCK_TAG_START)) {
						tagToken= this.slice(template.BLOCK_TAG_START.length, -template.BLOCK_TAG_END.length);
						return new template.Token(template.TOKEN_BLOCK, tagToken);
					}
					else if(this.startsWith(template.VARIABLE_TAG_START)) {
						return new template.Token(template.TOKEN_VAR, this.slice(template.VARIABLE_TAG_START.length, -template.VARIABLE_TAG_END.length));
					} else {
						return new template.Token(template.TOKEN_TEXT, this);
					}
				});
				
				return (new template.Parser(tokens)).parse();
			},
			_formRegx: function(){
				var ret = '';
				
				ret += '(' + template.BLOCK_TAG_START.rescape() + '.*?' + template.BLOCK_TAG_END.rescape() + 
				'|' + template.VARIABLE_TAG_START.rescape() + '.*?' + template.VARIABLE_TAG_END.rescape() + '|$' + ')';
				
				return ret;
			},		
			render: function(context){
				var result= [];
				
				//this._nodelist.each(function(){
				utils.forEach(this._nodelist, function(){
					if(typeof(this) === 'object') {
						typeof(this.render) === 'function' ?
							(result.push(this.render(context)))
							:
							(result.push(this.toString()));
					} else {
						result.push(this.toString());
					}
				});
				
				return result.join('');
			}
		}
	});
	
	Class.extend({
		meta: {
			name: 'Token',
			parent: _
		},
		prototype: {
			init: function(type, content){
				this.type= type;
				
				if(this.type !== template.TOKEN_TEXT) {
					// remove trailing and leading white spaces
					content= content.replace(/^\s+|\s+$/g, '');
				}
				
				this.content= content;
			},
			tsplit: function(){}
		}
	});
})(exports);
