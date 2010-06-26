(function(_){
	var
		__module__,
		utils= require('broke/core/utils'),
		extend= require('broke/core/utils').extend,
		translation= require('broke/utils/translation'),
		//template= require('broke/template/template'),
		ngettext= translation.ngettext,
		gettext= translation.gettext
	;
	
	__module__= {
		add: function(value){
			return parseInt(value, 10) + parseInt(value, 10);
		},
		addslashes: function(value){
			return value.replace('\\', '\\\\').replace('"', '\\"').replace("'", "\\'");
		},
		capfirst: function(value){
			return value[0].toUpperCase() + value.slice(1).toLowerCase();
		},
		center: function(value, args){
			return center(value, parseInt(args, 10));
		},
		cut: function(value, args){
			return value.replace(args, '');
		},
		date: function(value, args){
			if(utils.typeOf(value) !== 'date') {
				// assume it's a string with format year-month-day
				// e.g. 2009-12-31
				value= new Date(value);
			}
			
			return value.format(args);
		},
		'default': function(value, args){
			return value === '' ? args : value;
		},
		default_if_null: function(value, args){
			return value === null ? args : value;
		},
		dictsort: function(value){
			// TODO
			return value;
		},
		dictsortreversed: function(value){
			// TODO
			return value;
		},
		divisibleby: function(value, args){
			return parseInt(value, 10) && parseInt(args, 10);
		},
		escape: function(value){
			var
				baseEscapes= [
					['<', '&lt;']
					,['>', '&gt;']
					,["'", '&#39;']
					,['"', '&quot;']
					,['&', '&amp;']
				]
			;
			
			utils.forEach(baseEscapes, function(){
				var
					bad= this[0],
					good= this[1]
				;
				
				value.replace(bad, good);
			});
			
			return value;
		},
		escapejs: function(value){
			var
				baseJsEscapes= [
					['\\', '\x5C']
					,['\'', '\x27']
					,['"', '\x22']
					,['>', '\x3E']
					,['<', '\x3C']
					,['&', '\x26']
					,['=', '\x3D']
					,['-', '\x2D']
					,[';', '\x3B']
					,['\u2028', '\u2028']
					,['\u2029', '\u2029']
				]
			;
			
			//baseJsEscapes.each(function(){
			utils.forEach(baseJsEscapes, function(){
				var bad= this[0],
					good= this[1];
				
				value.replace(bad, good);
			});
			
			return value;
		},
		filesizeformat: function(bytes){
			var KB= 1024,
				MB= KB * 1024,
				GB= MB * 1024;
			
			bytes= parseInt(bytes, 10);
			
			if(bytes < KB) {
				return ngettext("%(size)d byte", "%(size)d bytes", bytes).interpolate({
					size: bytes
				});
			}
			if(bytes < MB) {
				return utils.interpolate(gettext('%s KB'), (bytes / KB));
			}
			if(bytes < GB) {
				return gettext('%s MB').echo(bytes / MB);
			}
			return gettext('%s GB').echo(bytes / GB);
		},
		first: function(list){
			return list[0];
		},
		fix_ampersands: function(value){
			return value.replace('&', '&amp;');
		},
		floatformat: function(value, args){
			value= value.split('.');
			args= value[1][args];
			return value[0] + args;
		},
		force_escape: function(value){
			return this.escape(value);
		},
		get_digit: function(value){
			var start= value * -1,
				end= start + 1;
			
			return value.slice(start, end);
		},
		iriencode: function(value){
			// TODO
			return value;
		},
		join: function(list, args){
			return list.join(args);
		},
		last: function(value){
			return utils.last(value);
		},
		length: function(value){
			return value.length;
		},
		length_is: function(value, args){
			return value.length === parseInt(args, 10);
		},
		linebreaks: function(value){
			// TODO
			return value;
		},
		linebreaksbr: function(value){
			return value.replace(/\n/g, '<br/>');
		},
		linenumbers: function(value){
			var numLines,
				//maxWidth,
				i,
				result= [];
			
			value= value.split('\n');
			numLines= value.length;
			//maxWidth= (new String(numLines)).length;
			
			for(i= 0; i< numLines; i++) {
				result.push((i+1) + '. ' + value[i]);
			}
			
			return result.join('');
		},
		ljust: function(value, spaces){
			spaces= parseInt(spaces, 10) - value.length;
			
			if(spaces) {
				value= value.split('');
				
				while(spaces--) {
					value.push(' ');
				}
			}
			
			return value.join('');
		},
		lower: function(value){
			return value.toLowerCase();
		},
		make_list: function(value){
			if(typeOf(value) === "number") {
				value= new String(value);
				
				return utils.map(value.split(''), function(){
					return parseInt(this, 10);
				});
			}
			
			return value.split('');
		},
		phone2numeric: function(value){
			// TODO
			return value;
		},
		pluralize: function(value, suffix){
			var suffixes= suffix.split(','),
				singularSuffix,
				pluralSuffix;
			
			if(suffixes.length > 1) {
				singularSuffix= suffixes[0];
				pluralSuffix= suffixes[1];
			} else {
				pluralSuffix= suffixes[0];
				singularSuffix= '';
			}
			
			if(value.length > 1) {
				return pluralSuffix;
			}
			return singularSuffix;
		},
		pprint: function(value){
			// TODO
			return value;
		},
		random: function(list){
			// TODO
			return list;
		},
		removetags: function(value, tags){
			//tags.split(' ').each(function(){
			utils.forEach(tags.split(' '), function(){
				value.replace('<' + this + '>', '').replace('</' + this + '>', '');
			});
			
			return value;
		},
		rjust: function(value, spaces){
			spaces= parseInt(spaces, 10) - value.length;
			
			if(spaces) {
				while(spaces--) {
					value += ' ';
				}
			}
			
			return value;
		},
		safe: function(value){
			// TODO
			return value;
		},
		safeseq: function(list){
			var _this= this;
			
			return utils.map(list, function(){
				return _this.save(this);
			});
		},
		slice: function(list, args){
			// slice as in javascript notation, not python notation
			// e.g. {{ myList|slice:"0, 3" }}
			args= args.split(',');
			
			if(args.length > 1) {
				return list.slice(parseInt(args[0], 10), parseInt(args[1], 10));
			}
			return list.slice(parseInt(args[0], 10));
		},
		slugify: function(value){
			return utils.slugify(value);
		},
		stringformat: function(value, args){
			// TODO
			return value;
		},
		striptags: function(value){
			return value.replace(/<[a-zA-Z_]>/g, '').replace(/<\/[a-zA-Z_]>/g, '');
		},
		time: function(value){
			// TODO
			return value;
		},
		timesince: function(value){
			// TODO
			return value;
		},
		timeuntil: function(value){
			// TODO
			return value;
		},
		title: function(value){
			// TODO
			return utils.capitalize(value);
		},
		truncatewords: function(value, numberOfWords){
			return value.split(' ').slice(0, numberOfWords).join('') + '...';
		},
		truncatewords_html: function(value){
			// TODO
			return value;
		},
		unordered_list: function(list){
			var createUl= function(list){
					var newUl= [];
					
					//list.each(function(){
					utils.forEach(list, function(){
						if(typeOf(this) === "array") {
							newUl.push('<ul>');
							newUl.push(createUl(this));
							newUl.push('</ul>');
						}
						newUl.push('<li>');
						newUl.push(this);
						newUl.push('</li>');
					});
					
					return newUl.join('');
				};
			
			return createUl(list);
		},
		upper: function(value){
			return value.toUpperCase();
		},
		urlencode: function(value){
			// TODO
			return value;
		},
		urlize: function(value){
			// TODO
			return value;
		},
		urlizetrunc: function(value){
			// TODO
			return value;
		},
		wordcount: function(value){
			return value.split(' ').length;
		},
		wordwrap: function(value, args){
			// TODO
			return value;
		},
		yesno: function(value, args){
			args= args.split(',');
			
			var yes= args[0],
				no= args[1],
				maybe= args[2] || no;
			
			if(value === null) {
				return maybe;
			} else if(value) {
				return yes;
			}
			
			return no;
		}
	};
	
	// register the default filters
	//template.filterList= __module__;
	
	extend(_, __module__);
})(exports);
