(function(_){
	var
		extend= require('broke/core/utils').extend
		,utils= require('broke/core/utils')
		,tpl= require('broke/template/template')
		,nodes= require('broke/template/nodes')
		,register= tpl.register
		,TemplateSyntaxError= require('broke/core/exceptions').TemplateSyntaxError
		,gettext= require('broke/utils/translation').gettext.gettext
		
		,IfTag= function(parser, token){
			var bits = token.content.split(/\s+/),
				linkType,
				nodeListTrue,
				nodeListFalse;
			
			bits.shift();
			
			if(!bits){
				throw new TemplateSyntaxError(gettext('If node need at least one args'));
			}
			
			var bitstr = bits.join(' '),
				boolPairs = bitstr.split(' or ');
			
			if(boolPairs.length == 1){
				linkType = nodes.IfNode._and;
				boolPairs = bitstr.split(' and ');
			} else {
				linkType = nodes.IfNode._or;
				
				if(bitstr.indexOf(' and ') !== -1) {
					throw new TemplateSyntaxError(gettext('If node do not alow mix "and" & "or"'));
				}
			}
			
			nodeListTrue = parser.parse(['else','endif']);
			token= parser.nextToken();
			
			if(token.content.indexOf('else') !== -1){
				nodeListFalse = parser.parse('endif');
				parser.deleteFirstToken();
			} else {
				nodeListFalse = [];
			}
			return new nodes.IfNode(linkType, boolPairs, nodeListTrue, nodeListFalse);	
		}
		,CommentTag= function(parser, token){
			parser.skipPast('endcomment');
			return new nodes.CommentNode();
		}
		,ForTag= function(parser, token) {
			var bits = token.content.split(/\s+/),
				loopvar= bits[1],
				sequence= bits[3],
				reversed= (bits.length === 5),
				nodeListLoop= parser.parse('endfor');
			
			if(bits.length == 5 && bits[4] != 'reversed'){
				throw new TemplateSyntaxError(gettext('The 4 args of for tag must be reversed'));
			}
			if(!utils.has([4, 5], bits.length)) {
				throw new TemplateSyntaxError(gettext('The for tag should have 4 or 5 args'));
			}
			if(bits[2] != 'in'){
				throw new TemplateSyntaxError(gettext('The 2nd args of for tag must be "in"'));
			}
			
			parser.deleteFirstToken();
			return new nodes.ForNode(loopvar,sequence,reversed,nodeListLoop);
		}
		,UrlTag= function(parser, token) {
			var bits = token.content.split(/\s+/),
				viewName= bits[1],
				args= bits[2].split(','),
				asVar;
			
			if(bits.length === 5){
				if(bits[3] !== 'as') {
					throw new TemplateSyntaxError(gettext('The 3 args of for tag must be "as"'));
				}
				asVar= bits[3];
			}
			
			return new nodes.UrlNode(viewName, args, asVar);
		}
	;
	
	register.tag('if', IfTag);
	register.tag('comment', CommentTag);
	register.tag('for', ForTag);
	register.tag('url', UrlTag);
	
	// TODO better
	utils.extend(_, {
		'if': IfTag
		,'comment': CommentTag
		,'for': ForTag
		,'url': UrlTag
	});
})(exports);
