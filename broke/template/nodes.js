(function(_){
	var
		utils= require('broke/core/utils'),
		Class= require('dependencies/pyjammin/class').Class,
		tpl= require('broke/template/template'),
		Template= tpl.Template,
		TemplateSyntaxError= require('broke/core/exceptions').TemplateSyntaxError,
		settings= require('broke/conf/settings').settings
	;
	
	Class.extend({
		__name__: 'VarNode'
		,__parent__: _
		,__init__: function(varstr){
			var
				args= varstr.split(tpl.FILTER_SEPARATOR)
			;
			
			this.varstr=  args[0];
			this.filters= args.slice(1);
			this.content= null;
		},
		applyFilters: function(){
			var _this= this;
			
			//this.filters.each(function(){
			utils.forEach(this.filters, function(){
				// split arguments to pass to the filter, if any
				var
					args= this.split(tpl.FILTER_ARGUMENT_SEPARATOR)[1] || null
				;
				
				if(!(this in tpl.filterList)) {
					// filter not found, fail silently...
					return;
				}
				
				_this.content= tpl.filterList[this](_this.content, args);
			});
			
			return this;
		},
		render: function(context){
			this.content= utils.getattr(this.varstr, context);
			
			if(this.filters) {
				this.applyFilters();
			}
			
			return this.content;
		}
	});
	
	Class.extend({
		__name__: 'TextNode'
		,__parent__: _
		,__init__: function(str){
			this.str= str;
		},
		render: function(){
			return this.str;
		}
	});
	
	Class.extend({
		__name__: 'CommentNode'
		,__parent__: _
		,__init__: function(str){
			this.str= str;
		},
		render: function(context){
			return '';
		}
	});
	
	Class.extend({
		__name__: 'IfNode'
		,__parent__: _
		,_and: 0
		,_or: 1
		,init: function(linkType, boolPairs, nodeListTrue, nodeListFalse){
			this.linkType = linkType;
			this.boolPairs = boolPairs;
			this.nodeListTrue = nodeListTrue;
			this.nodeListFalse = nodeListFalse;
		},
		render: function(context){
			var flag;
			
			if(this.linkType == this._and) {
				flag = true;
				
				if(this.mapBoolpair(false, context)) {
					flag=false;
				}
			} else {
				flag = false;
				
				if(this.mapBoolpair(true, context)) {
					flag=true;
				}
			}
			return flag ? Template.listRender(context, this.nodeListTrue) : Template.listRender(context, this.nodeListFalse);
		},
		mapBoolpair: function(tc, context){
			var tmpbp = '',
				bp = this.boolPairs,
				i,
				ilen;
			
			for(i= 0, ilen= bp.length; i< ilen; i++) {
				tmpbp = bp[i].split(' ');
				
				if(tmpbp.length== 2 && tmpbp[0] == 'not') {
					//if(tc != !!Template.getVar(context, tmpbp[1])) {
					if(tc != Template.getVar(context, tmpbp[1])) {
						return true;
					}
				} else {
					//if(tc == !!Template.getVar(context, tmpbp[0])) {
					if(tc == Template.getVar(context, tmpbp[0])) {
						return true;
					}
				}
			}
			return false;
		}
	});
	
	Class.extend({
		__name__: 'ForNode'
		,__parent__: _
		,__init__: function(loopvar, sequence, reversed, nodeListLoop){
			this.loopvar= loopvar;
			this.sequence= sequence.split('.');
			this.reversed= reversed;
			this.nodeListLoop= nodeListLoop;
		},
		render: function(context){
			var ret = [],
				parentloop,
				items = context,
				k,
				i,
				klen,
				ilen;
			
			if(context.forloop) {
				parentloop= context.forloop;
			}
			for(k= 0, klen= this.sequence.length; k< klen; k++) {
				items= items[this.sequence[k]];
			}
			
			if(!(items instanceof Array)){
				throw new TemplateSyntaxError(gettext('values is not a array'));
			}
			
			if(this.reversed){
				items = items.reverse();
			}
			
			for(i= 0, ilen= items.length; i< ilen; i++){
				context.forloop= {
					//shortcuts for current loop iteration number
					'counter0': i,
					'counter': i + 1,
					//reverse counter iteration numbers
					'revcounter': ilen - i,
					'revcounter0': ilen - i - 1,
					//boolean values designating first and last times through loop
					'first': (i === 0),
					'last': (i === (ilen - 1)),
					'parentloop': parentloop
				};
				
				context[this.loopvar] = items[i];
				ret.push(Template.listRender(context, this.nodeListLoop));
			}
			context.forloop = undefined;
			return ret.join('');
		}
	});
	
	Class.extend({
		__name__: 'UrlNode'
		,__parent__: _
		,__init__: function(viewName, args, asVar){
			this.viewName= viewName;
			this.args= args;
			this.asVar= asVar;
		},
		render: function(context){
			var reverse= broke.urlResolvers.reverse,
				args= [],
				projectName;
			
			//this.args.each(function(){
			utils.forEach(this.args, function(){
				var thisVar= utils.getattr(this, context);
				
				if(thisVar === undefined) {
					thisVar= parseInt(this, 10);
					
					if(utils.typeOf(thisVar) == "NaN") {
						thisVar = this;
					}
				}
				
				args.push(thisVar);
			});
			
			try {
				// named url ?
				url= reverse(this.viewName, args);
				
			} catch(e){
				if(e.name === "NoReverseMatch") {
					// nope, then it's a path to a view
					
					projectName= settings.SETTINGS_MODULE.split('.')[0];
					url= reverse(projectName + this.viewName, args);
				}
			}
			
			if(this.asVar) {
				context[this.asVar]= url;
				return ''
			}
			return url;
		}
	});
})(exports);
