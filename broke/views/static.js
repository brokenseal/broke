(function(_){
	var
		utils= require('broke/core/utils')
		,e= require('broke/core/exceptions')
		,MEDIA_ROOT= require('broke/conf/settings').settings.MEDIA_ROOT
		,http= require('broke/http/http')
		,mimetypes= require('dependencies/pyjammin/mimetypes')
		,fs= require('fs')
		,normalize= require('path').normalize
		,join= require('path').join
		//,renderToResponse= require('broke/shortcuts').renderToResponse
		,DEFAULT_DIRECTORY_INDEX_TEMPLATE = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">'+
		'<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">'+
			'<head>'+
				'<meta http-equiv="Content-type" content="text/html; charset=utf-8" />'+
				'<meta http-equiv="Content-Language" content="en-us" />'+
				'<meta name="robots" content="NONE,NOARCHIVE" />'+
				'<title>Index of {{ directory }}</title>'+
			'</head>'+
			'<body>'+
				'<h1>Index of {{ directory }}</h1>'+
				'<ul>'+
					//'{% ifnotequal directory "/" %}'+
					//	'<li><a href="../">../</a></li>'+
					//'{% endifnotequal %}'+
					'{% for f in file_list %}'+
						'<li><a href="{{ f|urlencode }}">{{ f }}</a></li>'+
					'{% endfor %}'+
				'</ul>'+
			'</body>'+
		'</html>'

		,serve= function(request, path, documentRoot, showIndexes){
			/*
			Serve static files below a given point in the directory structure.

			To use, put a URL pattern such as::

				var serve= require('broke/views/static).serve;
				[ '^static/(.*)$', serve, [ '/path/to/my/files/' ]);

			in your URLconf. You must provide the ``document_root`` as the first
			arguments of the extra arguments array. You may	also set ``show_indexes``
			to ``true`` as the second argument if you'd like to serve a basic index
			of the directory.  This index view will use the template hardcoded below,
			but if you'd like to override it, you can create a template called
			``static/directory_index.html``.
			*/

			var
				newPath= ''
				,fullPath
				,stat
				,mimeType
				,contents
				,response
			;

			documentRoot= documentRoot || MEDIA_ROOT;

			newPath= normalize(path);

			if(newPath != path) {
				return http.HttpResponseRedirect(newPath);
			}

			fullPath= join(documentRoot, newPath);
			stat= fs.statSync(fullPath);

			if(stat.isDirectory()) {
				if(showIndexes) {
					return directoryIndex(newPath, fullPath);
				}

				throw new http.Http404("Directory indexes are not allowed here.");
			}

			if(!stat.isFile()) {
				return new http.Http404(utils.interpolate('"%s" does not exist', fullpath));
			}

			mimeType= mimetypes.guess(fullPath) || 'application/octet-stream';

			// TODO
			//if not was_modified_since(request.META.get('HTTP_IF_MODIFIED_SINCE'), statobj[stat.ST_MTIME], statobj[stat.ST_SIZE]):
			//	return HttpResponseNotModified(mimetype=mimetype)

			contents= fs.readFileSync(fullPath, 'utf-8');
			response= new http.HttpResponse(contents, mimeType);

			response.setHeader("Last-Modified", stat.mtime);
			response.setHeader("Content-Length", contents.length);

			return response;
		}
		,directoryIndex= function(path, fullPath){
			var
				t
				,loader= require('broke/template/loader')
				,Template= require('broke/template/template').Template
			;

			// TODO
			// it still does not work pretty well

			try {
				// TODO
				t= loader.selectTemplate([ 'static/directory_index.html', 'static/directory_index' ]);
			} catch(e) {
				//if(e.name == e.TemplateDoesNotExist.name) {
					// TODO
		         // t = Template(DEFAULT_DIRECTORY_INDEX_TEMPLATE, name='Default directory index template')
					t= new Template(DEFAULT_DIRECTORY_INDEX_TEMPLATE);
				//} else {
				//	throw e;
				//}
			}

			return new http.HttpResponse(t.render({
				directory: path + '/'
				,root: '/static/'
				,file_list: fs.readdirSync(fullPath)
			}));
		}
	;

	utils.extend(_, {
		serve: serve
		,directoryIndex: directoryIndex
	});
})(exports);
