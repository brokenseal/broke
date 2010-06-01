(function(__global__){
	/* 
	 * A modified version of the Gettext implementation made by Joshua I. Miller <unrtst@cpan.org>
	 * Modified by Davide Callegari - http://www.brokenseal.it/
	 * 
	 * Pure Javascript implementation of Uniforum message translation.
	 * Copyright (C) 2008 Joshua I. Miller <unrtst@cpan.org>, all rights reserved
	
	 * This program is free software; you can redistribute it and/or modify it
	 * under the terms of the GNU Library General Public License as published
	 * by the Free Software Foundation; either version 2, or (at your option)
	 * any later version.
	
	 * This program is distributed in the hope that it will be useful,
	 * but WITHOUT ANY WARRANTY; without even the implied warranty of
	 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
	 * Library General Public License for more details.
	
	 * You should have received a copy of the GNU Library General Public
	 * License along with this program; if not, write to the Free Software
	 * Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307,
	 * USA.
	 */
	
	var
		contextGlue= "\004",
	    _localeData= {},
	    domain= 'messages',
	    localeData,
	    url= '',
		tryLoadLang= function() {
			var localeCopy,
				langLink,
				i,
				link;
			
			// check to see if language is statically included
			if (typeof(localeData) != 'undefined') {
			    // we're going to reformat it, and overwrite the variable
			    localeCopy = localeData;
			    localeData = undefined;
			    parseLocaleData(localeCopy);
				
			    if (typeof(_localeData[domain]) == 'undefined') {
			        throw new Error("Error: Gettext 'localeData' does not contain the domain '"+domain+"'");
			    }
			}
			
			// try loading from JSON
			// get lang links
			langLink = getLangRefs();
			
			if (typeof(langLink) == 'object' && langLink.length > 0) {
			    // NOTE: there will be a delay here, as this is async.
			    // So, any i18n calls made right after page load may not
			    // get translated.
			    // XXX: we may want to see if we can "fix" this behavior
			    for (i= 0; i< langLink.length; i++) {
			        link = langLink[i];
			        if (link.type == 'application/json') {
			            if (! tryLoadLangJson(link.href) ) {
			                throw new Error("Error: Gettext 'tryLoadLangJson' failed. Unable to exec xmlhttprequest for link ["+link.href+"]");
			            }
			        } else if (link.type == 'application/x-po') {
			            if (! tryLoadLangPo(link.href) ) {
			                throw new Error("Error: Gettext 'tryLoadLangPo' failed. Unable to exec xmlhttprequest for link ["+link.href+"]");
			            }
			        } else {
			            // TODO: implement the other types (.mo)
			            throw new Error("TODO: link type ["+link.type+"] found, and support is planned, but not implemented at this time.");
			        }
			    }
			}
		},
		parseLocaleData= function(localeData) {
			// This takes the bin/po2json'd data, and moves it into an internal form
			// for use in our lib, and puts it in our object as:
			//  _localeData = {
			//      domain : {
			//          head : { headfield : headvalue },
			//          msgs : {
			//              msgid : [ msgid_plural, msgstr, msgstr_plural ],
			//          },
			
			var domain,
				has_msgids,
				msgid,
				data,
				key,
				header,
				head,
				h;
			
			if (typeof(_localeData) == 'undefined') {
			    _localeData = { };
			}
			
			// suck in every domain defined in the supplied data
			for (domain in localeData) {
			    // skip empty specs (flexibly)
			    if ((! localeData.hasOwnProperty(domain)) || (! isValidObject(localeData[domain]))) {
			        continue;
			    }
			    // skip if it has no msgid's
			    has_msgids = false;
			    for (msgid in localeData[domain]) {
			        has_msgids = true;
			        break;
			    }
			    if(! has_msgids) {
					continue;
				}
			    // grab shortcut to data
			    data = localeData[domain];
			
			    // if they specifcy a blank domain, default to "messages"
			    if (domain == "") {
					domain = "messages";
			    }
			    // init the data structure
			    if (! isValidObject(_localeData[domain]) ) {
			        _localeData[domain] = { };
			    }
			    if (! isValidObject(_localeData[domain].head) ) {
			        _localeData[domain].head = { };
			    }
			    if (! isValidObject(_localeData[domain].msgs) ) {
			        _localeData[domain].msgs = { };
			    }
				
			    for(key in data) {
			        if (key == "") {
			            header = data[key];
			            for (head in header) {
			                h = head.toLowerCase();
			                _localeData[domain].head[h] = header[head];
			            }
			        } else {
			            _localeData[domain].msgs[key] = data[key];
			        }
			    }
			}
			
			// build the plural forms function
			for (domain in _localeData) {
				var plural_forms,
					pf_re,
					pf,
					code,
					p;
				
			    if (isValidObject(_localeData[domain].head['plural-forms']) &&
			        typeof(_localeData[domain].head.plural_func) == 'undefined') {
			        // untaint data
			        plural_forms = _localeData[domain].head['plural-forms'];
			        pf_re = new RegExp("^(\\s*nplurals\\s*=\\s*[0-9]+\\s*;\\s*plural\\s*=\\s*(?:\\s|[-\\?\\|&=!<>+*/%:;a-zA-Z0-9_\(\)])+)", 'm');
			        if (pf_re.test(plural_forms)) {
			            //ex english: "Plural-Forms: nplurals=2; plural=(n != 1);\n"
			            //pf = "nplurals=2; plural=(n != 1);";
			            //ex russian: nplurals=3; plural=(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10< =4 && (n%100<10 or n%100>=20) ? 1 : 2)
			            //pf = "nplurals=3; plural=(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2)";
						
			            pf = _localeData[domain].head['plural-forms'];
			            if (! /;\s*$/.test(pf)) {
							pf = pf.concat(';');
			            }
			            /* We used to use eval, but it seems IE has issues with it.
			             * We now use "new Function", though it carries a slightly
			             * bigger performance hit.
			            var code = 'function (n) { var plural; var nplurals; '+pf+' return { "nplural" : nplurals, "plural" : (plural === true ? 1 : plural ? plural : 0) }; };';
			            _localeData[domain].head.plural_func = eval("("+code+")");
			            */
			            code = 'var plural; var nplurals; '+pf+' return { "nplural" : nplurals, "plural" : (plural === true ? 1 : plural ? plural : 0) };';
			            _localeData[domain].head.plural_func = new Function("n", code);
			        } else {
			            throw new Error("Syntax error in language file. Plural-Forms header is invalid ["+plural_forms+"]");
			        }
			
			    // default to english plural form
			    } else if (typeof(_localeData[domain].head.plural_func) == 'undefined') {
			        _localeData[domain].head.plural_func = function (n) {
			            p = (n != 1) ? 1 : 0;
			            return { 'nplural' : 2, 'plural' : p };
			        };
			    } // else, plural_func already created
			}
			
			return;
		},
		tryLoadLangPo= function(uri) {
			// tryLoadLangPo : do an ajaxy call to load in the .po lang defs
			var data = getFile(uri),
				domain,
				parsed,
				rv;
	        
	        if (! data){
				return;
			}
			
			domain= uriBasename(uri);
			parsed= parsePo(data);
			rv= {};
			
	        // munge domain into/outof header
	        if (parsed) {
	            if (! parsed[""]) {
					parsed[""] = {};
	            }
	            if (! parsed[""].domain) {
					parsed[""].domain= domain;
	            }
	            domain= parsed[""].domain;
	            rv[domain]= parsed;
	    
	            parseLocaleData(rv);
	        }
	    
	        return 1;
	    },
	    parsePo= function(data) {
			var rv = {},
				buffer = {},
				lastbuffer = "",
				errors = [],
				lines = data.split("\n"),
				i,
				match,
				msg_ctxt_id,
				msgid_plural,
				trans,
				str,
				cur,
				hlines,
				pos,
				key,
				val,
				keylow;
	        
	        for (i= 0; i< lines.length; i++) {
	            // chomp
	            lines[i] = lines[i].replace(/(\n|\r)+$/, '');
				
	            // Empty line / End of an entry.
	            if (/^$/.test(lines[i])) {
	                if (typeof(buffer.msgid) != 'undefined') {
	                    msg_ctxt_id = (typeof(buffer.msgctxt) != 'undefined' && buffer.msgctxt.length) ?
											(buffer.msgctxt + contextGlue + buffer.msgid)
											:
											buffer.msgid;
						
						msgid_plural = (typeof(buffer.msgid_plural) != 'undefined' && buffer.msgid_plural.length) ?
	                                       buffer.msgid_plural
	                                       :
	                                       null;

	                    // find msgstr_* translations and push them on
	                    trans = [];
	                    for (str in buffer) {
							match= str.match(/^msgstr_(\d+)/);
							
	                        if (match) {
	                            trans[parseInt(match[1], 10)] = buffer[str];
	                        }
	                    }
	                    
	                    trans.unshift(msgid_plural);
	    
	                    // only add it if we've got a translation
	                    // NOTE: this doesn't conform to msgfmt specs
	                    if (trans.length > 1) {
							rv[msg_ctxt_id] = trans;
						}
						
	                    buffer= {};
	                    lastbuffer= "";
	                }
	    
	            // comments
	            } else if (/^#/.test(lines[i])) {
	                continue;
	            // msgctxt
	            } else if((match = lines[i].match(/^msgctxt\s+(.*)/))) {
	                lastbuffer = 'msgctxt';
	                buffer[lastbuffer] = parsePoDequote(match[1]);
	    
	            // msgid
	            } else if((match = lines[i].match(/^msgid\s+(.*)/))) {
	                lastbuffer = 'msgid';
	                buffer[lastbuffer] = parsePoDequote(match[1]);
	    
	            // msgid_plural
	            } else if ((match = lines[i].match(/^msgid_plural\s+(.*)/))) {
	                lastbuffer = 'msgid_plural';
	                buffer[lastbuffer] = parsePoDequote(match[1]);
	    
	            // msgstr
	            } else if ((match = lines[i].match(/^msgstr\s+(.*)/))) {
	                lastbuffer = 'msgstr_0';
	                buffer[lastbuffer] = parsePoDequote(match[1]);
	    
	            // msgstr[0] (treak like msgstr)
	            } else if((match = lines[i].match(/^msgstr\[0\]\s+(.*)/))) {
	                lastbuffer = 'msgstr_0';
	                buffer[lastbuffer] = parsePoDequote(match[1]);
	    
	            // msgstr[n]
	            } else if((match = lines[i].match(/^msgstr\[(\d+)\]\s+(.*)/))) {
	                lastbuffer = 'msgstr_'+match[1];
	                buffer[lastbuffer] = parsePoDequote(match[2]);
	    
	            // continued string
	            } else if (/^"/.test(lines[i])) {
	                buffer[lastbuffer] += parsePoDequote(lines[i]);
	            // something strange
	            } else {
	                errors.push("Strange line ["+i+"] : "+lines[i]);
	            }
	        }
	    
	    
	        // handle the final entry
	        if (typeof(buffer.msgid) != 'undefined') {
	            msg_ctxt_id = (typeof(buffer.msgctxt) != 'undefined' &&
	                               buffer.msgctxt.length) ?
	                              buffer.msgctxt + contextGlue + buffer.msgid
	                              :
	                              buffer.msgid;
	            msgid_plural = (typeof(buffer.msgid_plural) != 'undefined' &&
	                                buffer.msgid_plural.length) ?
	                               buffer.msgid_plural
	                               :
	                               null;
	    
	            // find msgstr_* translations and push them on
	            trans = [];
	            for (str in buffer) {
	                if ((match = str.match(/^msgstr_(\d+)/))) {
	                    trans[parseInt(match[1], 10)] = buffer[str];
	                }
	            }
	            trans.unshift(msgid_plural);
	    
	            // only add it if we've got a translation
	            // NOTE: this doesn't conform to msgfmt specs
	            if (trans.length > 1) {
					rv[msg_ctxt_id] = trans;
				}
				
	            buffer= {};
	            lastbuffer= "";
	        }
	        // parse out the header
	        if (rv[""] && rv[""][1]) {
	            cur = {};
	            hlines = rv[""][1].split(/\\n/);
	            
	            for (i=0; i< hlines.length; i++) {
	                if (! hlines.length) {
						continue;
					}
					
	                pos = hlines[i].indexOf(':', 0);
	                if (pos != -1) {
						key = hlines[i].substring(0, pos);
						val = hlines[i].substring(pos +1);
						keylow = key.toLowerCase();
						
	                    if (cur[keylow] && cur[keylow].length) {
	                        errors.push("SKIPPING DUPLICATE HEADER LINE: "+hlines[i]);
	                    } else if (/#-#-#-#-#/.test(keylow)) {
	                        errors.push("SKIPPING ERROR MARKER IN HEADER: "+hlines[i]);
	                    } else {
	                        // remove begining spaces if any
	                        val = val.replace(/^\s+/, '');
	                        cur[keylow] = val;
	                    }
	    
	                } else {
	                    errors.push("PROBLEM LINE IN HEADER: "+hlines[i]);
	                    cur[hlines[i]] = '';
	                }
	            }
	    
	            // replace header string with assoc array
	            rv[""] = cur;
	        } else {
	            rv[""] = {};
	        }
	    
	        // TODO: XXX: if there are errors parsing, what do we want to do?
	        // GNU Gettext silently ignores errors. So will we.
	        // alert( "Errors parsing po file:\n" + errors.join("\n") );
	    
	        return rv;
	    },
	    uriBasename= function(uri) {
	        var rv,
				ext_strip;
			
	        if ((rv = uri.match(/^(.*\/)?(.*)/))) {
	            if ((ext_strip = rv[2].match(/^(.*)\..+$/))) {
	                return ext_strip[1];
	            }
	            else {
					return rv[2];
	            }
	        } else {
	            return "";
	        }
	    },
	    parsePoDequote= function(str) {
	        var match;
	        
	        if ((match = str.match(/^"(.*)"/))) {
	            str = match[1];
	        }
	        
	        str = str.replace(/\\"/, "");
	        return str;
	    },
	    tryLoadLangJson= function(uri) {
		    // tryLoadLangJson : do an ajaxy call to load in the lang defs
	        var data= getFile(uri),
				rv;
			
	        if (! data) {
				return;
			}
			
	        rv = JSON(data);
	        parseLocaleData(rv);
	    
	        return 1;
	    },
	    getLangRefs= function() {
			// this finds all <link> tags, filters out ones that match our
			// specs, and returns a list of hashes of those
	        var langs= [],
				links= document.getElementsByTagName("link"),
				i;
			
	        // find all <link> tags in dom; filter ours
	        for (i= 0; i< links.length; i++) {
	            if (links[i].rel == 'gettext' && links[i].href) {
	                if (typeof(links[i].type) == 'undefined' || links[i].type == '') {
	                    if (/\.json$/i.test(links[i].href)) {
	                        links[i].type = 'application/json';
	                    } else if (/\.js$/i.test(links[i].href)) {
	                        links[i].type = 'application/json';
	                    } else if (/\.po$/i.test(links[i].href)) {
	                        links[i].type = 'application/x-po';
	                    } else if (/\.mo$/i.test(links[i].href)) {
	                        links[i].type = 'application/x-mo';
	                    } else {
	                        throw new Error("LINK tag with rel=gettext found, but the type and extension are unrecognized.");
	                    }
	                }

	                links[i].type = links[i].type.toLowerCase();
	                if (links[i].type == 'application/json') {
	                    links[i].type = 'application/json';
	                } else if (links[i].type == 'text/javascript') {
	                    links[i].type = 'application/json';
	                } else if (links[i].type == 'application/x-po') {
	                    links[i].type = 'application/x-po';
	                } else if (links[i].type == 'application/x-mo') {
	                    links[i].type = 'application/x-mo';
	                } else {
	                    throw new Error("LINK tag with rel=gettext found, but the type attribute ["+links[i].type+"] is unrecognized.");
	                }
	    
	                langs.push(links[i]);
	            }
	        }
	        return langs;
	    },
	    textdomain= function (domain) {
	        if (domain && domain.length){
				domain = domain;
	        }
	        
	        return domain;
	    },
	    gettext= function (msgid) {
			var msgctxt,
				msgid_plural,
				n,
				category;
			
			return dcnpgettext(null, msgctxt, msgid, msgid_plural, n, category);
	    },
	    dgettext= function (domain, msgid) {
			var msgctxt,
				msgid_plural,
				n,
				category;
	        
	        return dcnpgettext(domain, msgctxt, msgid, msgid_plural, n, category);
	    },
	    dcgettext= function (domain, msgid, category) {
			var msgctxt,
				msgid_plural,
				n;
			
	        return dcnpgettext(domain, msgctxt, msgid, msgid_plural, n, category);
	    },
	    ngettext= function (msgid, msgid_plural, n) {
			var msgctxt,
				category;

	        return dcnpgettext(null, msgctxt, msgid, msgid_plural, n, category);
	    },
	    dngettext= function (domain, msgid, msgid_plural, n) {
			var msgctxt,
				category;
			
	        return dcnpgettext(domain, msgctxt, msgid, msgid_plural, n, category);
	    },
	    dcngettext= function (domain, msgid, msgid_plural, n, category) {
	        var msgctxt;
	        
	        return dcnpgettext(domain, msgctxt, msgid, msgid_plural, n, category, category);
	    },
	    pgettext= function (msgctxt, msgid) {
			var msgid_plural,
				n,
				category;
			
	        return dcnpgettext(null, msgctxt, msgid, msgid_plural, n, category);
	    },
	    dpgettext= function (domain, msgctxt, msgid) {
			var msgid_plural,
				n,
				category;
			
	        return dcnpgettext(domain, msgctxt, msgid, msgid_plural, n, category);
	    },
	    dcpgettext= function (domain, msgctxt, msgid, category) {
			var msgid_plural,
				n;
			
	        return dcnpgettext(domain, msgctxt, msgid, msgid_plural, n, category);
	    },
	    npgettext= function (msgctxt, msgid, msgid_plural, n) {
	        var category;
	        
	        return dcnpgettext(null, msgctxt, msgid, msgid_plural, n, category);
	    },
	    dnpgettext= function (domain, msgctxt, msgid, msgid_plural, n) {
	        var category;
	        
	        return dcnpgettext(domain, msgctxt, msgid, msgid_plural, n, category);
	    },
		dcnpgettext= function (domain, msgctxt, msgid, msgid_plural, n, category) {
		    // this has all the options, so we use it for all of them.
	        if (! isValidObject(msgid)) {
				return '';
			}

			var plural = isValidObject(msgid_plural),
				msg_ctxt_id = isValidObject(msgctxt) ? msgctxt+contextGlue+msgid : msgid,
				domainname = isValidObject(domain) ? domain :
								isValidObject(domain) ? domain : 'messages';
			
	        // category is always LC_MESSAGES. We ignore all else
	        var category_name= 'LC_MESSAGES',
				localeData= [],
				dom;
			
			category = 5;
			
	        if (typeof(_localeData) != 'undefined' && isValidObject(_localeData[domainname])) {
	            localeData.push( _localeData[domainname] );
	        } else if (typeof(_localeData) != 'undefined') {
	            // didn't find domain we're looking for. Search all of them.
	            for (dom in _localeData) {
	                localeData.push( _localeData[dom] );
	            }
	        }
	    
			var trans = [],
				found = false,
				domain_used,
				i,
				j,
				translation,
				locale,
				p,
				rv;
	        
	        if (localeData.length) {
	            for (i= 0; i< localeData.length; i++) {
	                locale = localeData[i];
	                
	                if (isValidObject(locale.msgs[msg_ctxt_id])) {
	                    // make copy of that array (cause we'll be destructive)
	                    for (j= 0; j< locale.msgs[msg_ctxt_id].length; j++) {
	                        trans[j] = locale.msgs[msg_ctxt_id][j];
	                    }
	                    trans.shift(); // throw away the msgid_plural
	                    domain_used = locale;
	                    found = true;
	                    break;
	                }
	            }
	        }
	    
	        // default to english if we lack a match
	        if (! trans.length) {
	            trans = [ msgid, msgid_plural ];
	        }
	    
	        translation = trans[0];
	        if (plural) {
	            if (found && isValidObject(domain_used.head.plural_func) ) {
	                rv = domain_used.head.plural_func(n);
					if (! rv.plural) {
						rv.plural = 0;
					}
					if (! rv.nplural) {
						rv.nplural = 0;
					}
					// if plurals returned is out of bound for total plural forms
					if (rv.nplural <= rv.plural) {
						rv.plural = 0;
					}
					p = rv.plural;
	            } else {
	                p = (n != 1) ? 1 : 0;
	            }
	            if (isValidObject(trans[p])) {
	                translation = trans[p];
	            }
	        }
	    
	        return translation;
	    },
	    strargs= function (str, args) {
		    /* utility method, since javascript lacks a printf */
	        // make sure args is an array
	        if ( null === args || 'undefined' === typeof(args) ) {
	            args = [];
	        } else if (args.constructor != Array) {
	            args = [args];
			}
			
            // NOTE: javascript lacks support for zero length negative look-behind
            // in regex, so we must step through w/ index.
            // The perl equiv would simply be:
            //    $string =~ s/(?<!\%)\%([0-9]+)/$args[$1]/g;
            //    $string =~ s/\%\%/\%/g; # restore escaped percent signs
            
	        var newstr = "",
				i,
				match_n,
				arg_n,
				length_n;
			
	        while (true) {
				i = str.indexOf('%');
				
	            // no more found. Append whatever remains
	            if (i == -1) {
	                newstr += str;
	                break;
	            }
	    
	            // we found it, append everything up to that
	            newstr += str.substr(0, i);
	    
	            // check for escpaed %%
	            if (str.substr(i, 2) == '%%') {
	                newstr += '%';
	                str = str.substr((i+2));
	    
	            // % followed by number
	            } else if ((match_n = str.substr(i).match(/^%(\d+)/))) {
	                arg_n = parseInt(match_n[1], 10);
	                length_n = match_n[1].length;
	                if ( arg_n > 0 && args[arg_n -1] != null && typeof(args[arg_n -1]) != 'undefined' ) {
	                    newstr += args[arg_n -1];
	                }
	                
	                str= str.substr( (i + 1 + length_n) );
				
	            // % followed by some other garbage - just remove the %
	            } else {
	                newstr += '%';
	                str = str.substr((i+1));
	            }
	        }
			
	        return newstr;
	    },
	    isArray= function (thisObject) {
		    /* verify that something is an array */
	        return isValidObject(thisObject) && thisObject.constructor == Array;
	    },
	    isValidObject= function (thisObject) {
		    /* verify that an object exists and is valid */
	        if (null == thisObject) {
	            return false;
	        } else if ('undefined' == typeof(thisObject) ) {
	            return false;
	        } else {
	            return true;
	        }
	    },
		getFile= function(path){
			var
				fs
			;
			
			try {
				// are we using node js?
				fs= require('fs');
				// TODO: check that...
				return fs.openSync(path, 'r');
				
			} catch(e) {
				
				// let's assume we are using a browser
				return sjax(path);
				
			}
		},
		sjax= function (uri) {
			var xmlhttp;
			if (window.XMLHttpRequest) {
				xmlhttp = new XMLHttpRequest();
			} else if (navigator.userAgent.toLowerCase().indexOf('msie 5') != -1) {
				xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
			} else {
				xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
			}
			
			if (! xmlhttp) {
				throw new Error("Your browser doesn't support Ajax. Unable to support external language files.");
			}
			
			xmlhttp.open('GET', uri, false);
			
			try {
				xmlhttp.send(null);
			} catch (e) {
				return;
			}
			
			// we consider status 200 and 0 as ok.
			// 0 happens when we request local file, allowing this to run on local files
			var sjax_status = xmlhttp.status;
			if (sjax_status == 200 || sjax_status == 0) {
				return xmlhttp.responseText;
			} else {
				var error = xmlhttp.statusText + " (Error " + xmlhttp.status + ")";
				if (xmlhttp.responseText.length) {
					error += "\n" + xmlhttp.responseText;
				}
				//alert(error);
				return;
			}
		},
	    JSON= function (data) {
	        return eval('(' + data + ')');
	    };
	
	// external API
	__global__.gettext= {
		dcnpgettext: dcnpgettext,
		dnpgettext: dnpgettext,
		npgettext: npgettext,
		dcpgettext: dcpgettext,
		dpgettext: dpgettext,
		pgettext: pgettext,
		dcngettext: dcngettext,
		dngettext: dngettext,
		ngettext: ngettext,
		dcgettext: dcgettext,
		dgettext: dgettext,
		gettext: gettext,
		textdomain: textdomain,
		parsePo: parsePo,
		tryLoadLangPo: tryLoadLangPo,
		tryLoadLang: tryLoadLang
	};
})(this);
