(function(_){
	var
		settings= require('broke/conf/settings').settings
		,exceptions= require('broke/core/exceptions')
		,utils= require('broke/core/utils')
		,loader= require('broke/template/loader')
		,http= require('broke/http/http')
		
		,Http404= http.Http404
		,HttpResponse= http.HttpResponse
		//,applyContextProcessors= function(response){
		//	utils.forEach(settings.CONTEXT_PROCESSORS, function(){
		//		var contextProcessor= utils.getattr(this);
		//		
		//		utils.extend(response.context, contextProcessor(response));
		//	});
		//	
		//	return response.context;
		//}
		,renderToString= require('broke/template/loader').renderToString
		
		,renderToResponse= function(templateName, context, contextInstance, mimeType){
			var
				args= Array.prototype.slice.call(arguments)
				,content
			;

			mimeType= mimeType || null;
			
			return new HttpResponse(loader.renderToString(templateName, context, contextInstance), mimeType);
		}
		
		,html= {
			create: function(response){
				/* response= {
				 *     template: compulsory template
				 *     context: template's context
				 *     method: after|before|append|prepend|wrap. it defaults to 'append'
				 *     htmlNode: node or string to search the node,
				 *         to which append the newly created node.
				 *         it defaults to 'body'
				 *     additionalProperties: additional properties to append to the
				 *         newly created htmlNode
				 *     callback: a function that gets applied to the newly created htmlNode
				 * }
				 *
				 */
				var
					allowedMethods= [ 'after', 'before', 'append', 'prepend', 'wrap' ]
					//,context= applyContextProcessors(response)
					,context= response.context
					,renderedTemplate= renderToString(response.template, context)
					,newElement= $(renderedTemplate)
				;
				
				// default arguments
				response= utils.extend({
					method: 'append',
					htmlNode: 'body'
				}, response);
				
				if(utils.has(allowedMethods, response.method)) {
					$(response.htmlNode)[response.method](newElement);
				} else if(response.method === null) {
					// do nothing
				} else {
					throw new exceptions.NotImplementedError(utils.interpolate(gettext("The selected template's method (%s) is not implemented. Options are: %s"), response.method, allowedMethods.join(', ')));
				}
				
				response.element= newElement;
				
				return response;
			},
			replace: function(response){
				/*
				 * Renders the template and then replace the element with the
				 * rendered template
				 * response= {
				 *     template: compulsory template
				 *     context: template's context
				 *     htmlNode: node or string to search the node,
				 *         with which replace the newly created node
				 *     additionalProperties: additional properties to append to the
				 *         newly created htmlNode
				 *     callback: a function that gets applied to the newly created htmlNode
				 * }
				 *
				 */
				var
					//context= applyContextProcessors(response),
					context= response.context,
					renderedTemplate= renderToString(response.template, context),
					newElement= $(renderedTemplate)
				;
				
				//replace
				$(response.htmlNode).replaceWith(newElement);
				
				response.element= newElement;
				
				return response;
			},
			update: function(response){
				/*
				 response= {
				 *     object: object with which update the html node
				 *     htmlNode: node or string to search the node to update
				 *     attribute: rel|class
				 *     childrenOnly: whether you want to search direct descendant only
				 *         for optimizations purpose or all the descendants
				 *     additionalProperties: additional properties to append to the
				 *         every single updated node
				 *     callback: a function that gets applied to the newly created htmlNode
				 * }
				 *
				 * This method expect the html node to have children with 
				 * the rel or class attribute corresponding to fields of the object
				 *
				 * i.e.
				 *     object's fields: {
				 *         title: 'New title',
				 *         description: 'New description',
				 *     }
				 *     html node: 
				 *     <ul>
				 *         <li rel="title">My title</li>
				 *         <li rel="description">My description</li>
				 *     </ul>
				 *	
				 * would become:
				 *
				 *     html node: <ul>
				 *         <li rel="title">New title</li>
				 *         <li rel="description">New description</li>
				 *     </ul>
				 *
				 * WARNING: quite resource heavy on big html nodes
				 * TODO: optimize
				 *	
				 */
				var
					acceptedAttributes= ['class', 'rel'],
					searchFor
				;
				
				// default arguments
				response= utils.extend({
					attribute: 'rel',
					childrenOnly: true
				}, response);
				
				searchFor= response.childrenOnly ? '> *' : '*';
				
				if(!utils.has(acceptedAttributes, response.attribute)) {
					throw new exceptions.NotImplementedError(utils.interpolate(gettext("You can not use %s's attribute. Options are: class, rel"), response.attribute));
				}
				
				$(response.htmlNode).find(searchFor).each(function(){
					var _this= $(this),
						key;
					
					for(key in response.object.fields) {
						
						if(response.object.fields.hasOwnProperty(key) && _this.attr(response.attribute) !== undefined) {
							
							if(utils.contains(_this.attr(response.attribute), key)) {
								
								// update the node
								_this.html(response.object.fields[key]);
							}
						}
					}
				});
				
				response.element= response.htmlNode;
				
				return true;
			}
		}
	;
	
	utils.extend(_, {
		html: html
		,renderToResponse: renderToResponse
	});
})(exports);
