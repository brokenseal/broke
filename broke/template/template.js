/* 
 * Template engine based on the work of xiaocong.hust and John.Sec.Huang
 * http://code.google.com/p/jtl-javascript-template/
 * MIT Licensed
 * 
 */

(function(){
	var template= broke.template;
	
	broke.extend(template, {
		tagList: {},
		filterList: {},
		register: {
			tag: function(tagName, fn) {
				broke.template.tagList[tagName]= fn;
			},
			filter: function(filterName, fn) {
				broke.template.filterList[filterName]= fn;
			}
		},
		Template: {},
		Parser: {},
		VarNode: {},
		TextNode: {},
		CommentNode: {},
		IfNode: {},
		ForNode: {},
		Token: {}
	});
	
	broke.Class.extend("broke.template.Template", {
		VAR_TOKEN: 0,
		TAG_TOKEN: 1,
		TEXT_TOKEN: 2,
		_re: {
			TAG_START : '{%',
			TAG_END : '%}',
			VAR_START : '{{',
			VAR_END : '}}'	
		},
		listRender: function(context, nodelist) {
			var ret = [],
				i,
				ilen;
			
			for(i= 0, ilen= nodelist.length; i< ilen; i++) {
				ret.push(nodelist[i].render(context));
			}
			return ret.join('');	
		},
		getVar: function(context,varstr) {
			var ret= context,
				va= varstr.split('.'),
				i,
				ilen;
			
			for(i= 0, ilen= va.length; i< ilen; i++) {
				ret = ret[va[i]];
			}
			return ret;	
		}
	},{
		init: function(tpl){
			this._nodelist = this._compile(tpl);
		},
		_compile: function(tpl){
			var _this= this,
				tokens,
				tag_str = this._formRegx(),
				tag_re = new RegExp(tag_str,'g'),
				bits = tpl.bsplit(tag_re);
			
			bits= bits.filter(function(){
				return this !== '';
			});
			
			// create token
			tokens= bits.map(function(){
				var _re = _this.Class._re,
					tagToken,
					varToken;
				
				if(this.startsWith(_re.TAG_START)) {
					tagToken= this.slice(_re.TAG_START.length,-_re.TAG_END.length);
					return new template.Token(_this.Class.TAG_TOKEN, tagToken);
				}
				else if(this.startsWith(_re.VAR_START)) {
					return new template.Token(_this.Class.VAR_TOKEN, this.slice(_re.VAR_START.length,-_re.VAR_END.length));
				} else {
					return new template.Token(_this.Class.TEXT_TOKEN, this);
				}
			});
			
			return (new template.Parser(tokens)).parse();
		},
		_formRegx: function(){
			var re = this.Class._re,ret = '';
			
			ret += '(' + re.TAG_START.rescape() + '.*?' + re.TAG_END.rescape() + 
			'|' + re.VAR_START.rescape() + '.*?' + re.VAR_END.rescape() + '|$' + ')';
			
			return ret;
		},		
		render: function(context){
			var ret = [],
				nodelist = this._nodelist,
				node;
			
			for(var i=0,ilen=nodelist.length;i<ilen;i++){
				node = nodelist[i];
				if(typeof(node)=='object') {
					typeof(node.render)=='function' ? ret.push(node.render(context)) : ret.push(node.toString());
				} else {
					ret.push(node.toString());
				}
			}
			return ret.join('');
		}
	});
})();
