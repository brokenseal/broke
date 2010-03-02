(function(){
	var ngettext= broke.utils.translation.ngettext,
		gettext= broke.utils.translation.gettext,
		defaultFilters= {
		add: function(value){
			return value.asInt() + value.asInt();
		},
		addslashes: function(value){
			return value.replace('\\', '\\\\').replace('"', '\\"').replace("'", "\\'");
		},
		capfirst: function(value){
			return value[0].upper() + value.slice(1).lower();
		},
		center: function(value, args){
			return center(value, args.asInt());
		},
		cut: function(value, args){
			return value.replace(args, '');
		},
		date: function(value, args){
			if(typeOf(value) !== 'date') {
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
			return value.asInt() && args.asInt();
		},
		escape: function(value){
			var baseEscapes= [
				['<', '&lt;'],
				['>', '&gt;'],
				["'", '&#39;'],
				['"', '&quot;'],
				['&', '&amp;']
			];
			//baseEscapes.each(function(){
			forEach(baseEscapes, function(){
				var bad= this[0],
					good= this[1];
				
				value.replace(bad, good);
			});
			
			return value;
		},
		escapejs: function(value){
			var baseJsEscapes= [
				['\\', '\x5C'],
				['\'', '\x27'],
				['"', '\x22'],
				['>', '\x3E'],
				['<', '\x3C'],
				['&', '\x26'],
				['=', '\x3D'],
				['-', '\x2D'],
				[';', '\x3B'],
				['\u2028', '\u2028'],
				['\u2029', '\u2029']
			];
			
			//baseJsEscapes.each(function(){
			forEach(baseJsEscapes, function(){
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
			
			bytes= bytes.asInt();
			
			if(bytes < KB) {
				return ngettext("%(size)d byte", "%(size)d bytes", bytes).interpolate({
					size: bytes
				});
			}
			if(bytes < MB) {
				return gettext('%s KB').echo(bytes / KB);
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
			return value.last();
		},
		length: function(value){
			return value.length;
		},
		length_is: function(value, args){
			return value.length === args.asInt();
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
			spaces= spaces.asInt() - value.length;
			
			if(spaces) {
				value= value.split('');
				
				while(spaces--) {
					value.push(' ');
				}
			}
			
			return value.join('');
		},
		lower: function(value){
			return value.lower();
		},
		make_list: function(value){
			if(typeOf(value) === "number") {
				value= new String(value);
				
				return map(value.split(''), function(){
					return this.asInt();
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
			forEach(tags.split(' '), function(){
				value.replace('<' + this + '>', '').replace('</' + this + '>', '');
			});
			
			return value;
		},
		rjust: function(value, spaces){
			spaces= spaces.asInt() - value.length;
			
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
			
			return map(list, function(){
				return _this.save(this);
			});
		},
		slice: function(list, args){
			// slice as in javascript notation, not python notation
			// e.g. {{ myList|slice:"0, 3" }}
			args= args.split(',');
			
			if(args.length > 1) {
				return list.slice(args[0].asInt(), args[1].asInt());
			}
			return list.slice(args[0].asInt());
		},
		slugify: function(value){
			return value.slugify();
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
			return value.capitalize();
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
					forEach(list, function(){
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
			return value.upper();
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
	
	broke.extend(broke.template, {
		defaultFilters: defaultFilters
	});
	
	// register the default filters
	broke.extend(broke.template, {
		filterList: defaultFilters
	});
})();
