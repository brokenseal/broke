/****************************************************************************/
/**************************** TEMPLATE SYSTEM *******************************/
/****************************************************************************/

/*
 * 
 * 
 * 
 */

broke.extend({
	template: {
		create: function(response){
			/*
			 response= {
			 * 		template: compulsory template
			 * 		context: template's context
			 * 		method: after|before|append|prepend|wrap. it defaults to 'append'
			 * 		htmlNode: node or string to search the node,
			 * 			to which append the newly created node.
			 * 			it defaults to 'body'
			 * 		additionalProperties: additional properties to append to the
			 * 			newly created htmlNode
			 * 		callback: a function that gets applied to the newly created htmlNode
			 * }
			 *
			 */
			var allowedMethods= ['after', 'before', 'append', 'prepend', 'wrap'],
				newElement= $(response.template.render(response.context)),
				key;
			
			// default arguments
			response= broke.extend({
				method: 'append',
				htmlNode: 'body'
			}, response);
			
			if(!allowedMethods.has(response.method)) {
				throw broke.exceptions.NotImplemented("The selected template's method (%s) is not implemented.\
												   Options are: after, before, append, prepend, wrap".echo(response.method));
			}
			
			$(response.htmlNode)[response.method](newElement);
			
			// apply additional properties
			for(key in response.additionalProperties) {
				newElement[key]= response.additionalProperties[key];
			}
			
			// apply callback
			if('callback' in response) {
				response.callback.apply(newElement);
			}
			
			return newElement;
		},
		replace: function(response){
			/*
			 * Renders the template and then replace the element with the
			 * rendered template
			 * 
			 response= {
			 * 		template: compulsory template
			 * 		context: template's context
			 * 		htmlNode: node or string to search the node,
			 * 			with which replace the newly created node
			 * 		additionalProperties: additional properties to append to the
			 * 			newly created htmlNode
			 * 		callback: a function that gets applied to the newly created htmlNode
			 * }
			 *
			 */
			var newElement= $(response.template.render(response.context)),
				key;
			
			//replace
			$(response.htmlNode).replaceWith(newElement);
			
			// apply additional properties
			for(key in response.additionalProperties) {
				newElement[key]= response.additionalProperties[key];
			}
			
			// apply callback
			if('callback' in response) {
				response.callback.apply(newElement);
			}
			
			return newElement;
		},
		update: function(response){
			/*
			 response= {
			 * 		object: object with which update the html node
			 * 		htmlNode: node or string to search the node to update
			 * 		attribute: rel|class
			 * 		childrenOnly: whether you want to search direct descendant only
			 * 			for optimizations purpose or all the descendants
			 * 		additionalProperties: additional properties to append to the
			 * 			every single updated node
			 * 		callback: a function that gets applied to the newly created htmlNode
			 * }
			 *
			 * This method expect the html node to have children with 
			 * the rel or class attribute corresponding to fields of the object
			 *
			 * i.e.
			 * 		object's fields: {
			 * 			title: 'New title',
			 * 			description: 'New description',
			 * 		}
			 * 		html node: <ul>
			 * 			<li rel="title">My title</li>
			 * 			<li rel="description">My description</li>
			 * 		</ul>
			 *	
			 *	would become:
			 *	
			 * 		html node: <ul>
			 * 			<li rel="title">New title</li>
			 * 			<li rel="description">New description</li>
			 * 		</ul>
			 *	
			 *	WARNING: quite resource heavy on big html nodes
			 *	TODO: optimize
			 *	
			 */
			var acceptedAttributes= ['class', 'rel'],
				searchFor,
				key,
				subKey;
			
			// default arguments
			response= broke.extend({
				attribute: 'rel',
				childrenOnly: true
			}, response);
			
			searchFor= response.childrenOnly ? '> *' : '*';
			
			if(!acceptedAttributes.has(response.attribute)) {
				throw broke.exceptions.NotImplemented("You can not use %s's attribute.\
												   Options are: class, rel".echo(response.attribute));
			}
			
			$(response.htmlNode).find(searchFor).each(function(){
				var _this= $(this);
				
				for(key in response.object.fields) {
					
					if(response.object.fields.hasOwnProperty(key) && _this.attr(response.attribute) !== undefined) {
						
						if(_this.attr(response.attribute).contains(key)) {
							
							// update the node
							_this.html(response.object.fields[key]);
						}
					}
				}
			});
			// apply additional properties
			for(key in response.additionalProperties) {
				response.htmlNode[key]= response.additionalProperties[key];
			}
			
			// apply callback
			if('callback' in response) {
				response.callback.apply(response.htmlNode);
			}
			
			return true;
		}
	}
});
