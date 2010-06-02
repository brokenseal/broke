(function(_){
	var
		Class= require('dependencies/class').Class,
		tpl= require('broke/template/template'),
		gettext= require('broke/utils/translation').gettext,
		TemplateSyntaxError= require('broke/core/exceptions').TemplateSyntaxError
	;
	
	Class.extend({
		meta: {
			name: 'Parser',
			parent: _
		},
		prototype: {
			init: function(tokens){
				this.tokens= tokens;
			},
			parse: function(parseUntil){
				var nodelist = [],
					token = null,
					tagFuncName = null,
					tagFunc = null;
				
				if(!parseUntil) {
					parseUntil = [];
				}
				if(!(parseUntil instanceof Array)) {
					parseUntil= [parseUntil];
				}
				
				while(this.tokens.length){
					token= this.tokens.shift();
					
					if(token.type === tpl.TOKEN_TEXT){
						nodelist.push(new tpl.TextNode(token.content));
					}
					else if(token.type === tpl.TOKEN_VAR){
						nodelist.push(new tpl.VarNode(token.content));
					}
					else if(token.type === tpl.TOKEN_BLOCK) {
						if(parseUntil.has(token.content)) {
							this.prependToken(token);
							return nodelist;
						}
						
						tagFuncName= token.content.split(/\s+/)[0];
						
						if(!tagFuncName) {
							throw new TemplateSyntaxError(gettext('Empty Tag'));
						}
						tagFunc = tpl.tagList[tagFuncName];
						
						if(!tagFunc) {
							throw new TemplateSyntaxError(gettext('Unknow Tag'));
						}
						nodelist.push(tagFunc(this,token));
					}
				}
				return nodelist;
			},
			skipPast: function(endtag){
				var token = null;
				
				while(this.tokens.length){
					token = this.tokens.shift();
					
					if(token.type === tpl.TOKEN_BLOCK && token.content === endtag){
						return;
					}
				}
				throw new TemplateSyntaxError(gettext('Not Closed Tag'));
			},
			prependToken: function(token){
				this.tokens.unshift(token);
			},
			nextToken: function(){
				return this.tokens.shift();
			},
			deleteFirstToken: function(){
				this.tokens.shift();
				return true;
			}
		}
	});
})(exports);
