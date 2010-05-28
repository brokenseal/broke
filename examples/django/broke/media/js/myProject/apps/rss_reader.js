(function(__global__){
	// models
	var
		Model= require('broke/db/models').Model,
		rss_reader= myProject.apps.rss_reader,
		reverse= require('broke/core/urlresolvers').reverse,
		Feed,
		create= broke.shortcuts.node.create,
		renderToString= broke.template.loader.renderToString
	;
	
	// Feed
	Feed= Model.extend({
		meta: {
			name: 'Feed',
			parent: 'myProject.apps.rss_reader'
		},
		klass: {
			init: function(){
				this.appLabel= 'rss_reader';
				this.tableName= "%s_%s".echo(this.appLabel, this.className.lower());
				
				this._super();
			},
			incrementalPk: 1,
			autoInit: false
		},
		prototype: {
			init: function(args){
				args.pk= this.Class.incrementalPk++;
				this._super(args);
			}
		}
	});
	
	// views
	rss_reader.views= {
		save: function(request, args){
			var
				form= $(request.event.target)
			;
			
			form.slideUp();
			rss_reader.views.add(request, [form.find('input[name="feed_url"]').val()]);
			
			return {};
		},
		viewForm: function(request, args){
			var
				form= Feed.elements('form')
			;
			form.slideDown();
			
			return {};
		},
		addFeedElement: function(request, args){
			var
				pk= args[0].asInt(),
				newFeed= Feed.objects.get({pk: pk}),
				title= args[1]
			;
			
			return create({
				template: 'feed_element.html',
				htmlNode: newFeed.Class.elements('ul'),
				context: {
					feed: newFeed,
					title: title,
					feedView: reverse('rss_reader-view', [newFeed.fields.url])
				}
			});
		},
		add: function(request, args){
			var
				newFeedUrl= args[0],
				newFeed= Feed.objects.create({
					fields: {
						url: newFeedUrl
					}
				}),
				title= ''
			;
			
			$.jGFeed(newFeedUrl, function(feeds){
				if(!feeds){
					return false;
				}
				title= feeds.title;
				
				broke.request(reverse('rss_reader-add_feed_element', [newFeed.pk, title]));
			}, 1);
			
			return {};
		},
		view: function(request, args){
			var
				feedUrl= args[0],
				content= $('#content'),
				Template= broke.template.Template
			;
			
			$.jGFeed(feedUrl, function(feeds){
				if(!feeds){
					return false;
				}
				content.empty();
				
				forEach(feeds.entries, function(){
					var
						feed= renderToString('feed_view.html', { feed: this})
					;
					
					content.append(feed);
				});
			}, 10);
			
			return {};
		}
	};
	
	// urls
	rss_reader.urlPatterns= [
		['view_form/$', rss_reader.views.viewForm, 'view_form'],
		['save/$', rss_reader.views.save, 'save'],
		['add/(.*)$', rss_reader.views.add, 'add'],
		['view/(.*)$', rss_reader.views.view, 'view'],
		['add_feed_element/([0-9]+)/(.*)/$', rss_reader.views.addFeedElement, 'add_feed_element']
	];
	
	broke.extend(broke.urlPatterns, rss_reader.urlPatterns);
})(this);

$(function(){
	var
		reverse= broke.urlResolvers.reverse
	;
	
	broke.extend(broke.conf.settings, {
		SAVE: {
			commit: false
		}
	});
	
	// add some content...
	broke.request(reverse('rss_reader-add', ['http://github.com/brokenseal.atom']));
});
