(function(){
	// models
	var Model= broke.db.models.Model,
		rss_reader= myProject.apps.rss_reader,
		reverse= broke.urlResolvers.reverse,
		Feed,
		create= broke.shortcuts.node.create;
	
	// Feed
	Model.extend("myProject.apps.rss_reader.models.Feed", {
		init: function(){
			this.appLabel= 'rss_reader';
			this.tableName= "%s_%s".echo(this.appLabel, this.className.lower());
			
			this._super();
		},
		incrementalPk: 1,
		autoInit: false
	},{
		init: function(args){
			args.pk= this.Class.incrementalPk++;
			this._super(args);
		}
	});
	
	Feed= myProject.apps.rss_reader.models.Feed
	
	// views
	rss_reader.views= {
		save: function(request, args){
			var form= $(request.event.target);
			
			form.slideUp();
			rss_reader.views.add(request, [form.find('input[name="feed_url"]').val()]);
			
			return {};
		},
		viewForm: function(request, args){
			var form= Feed.elements('form');
			form.slideDown();
			
			return {};
		},
		addFeedElement: function(request, args){
			var pk= args[0].asInt(),
				newFeed= Feed.objects.get({pk: pk}),
				title= args[1];
			
			return create({
				template: 'feedElement',
				htmlNode: newFeed.Class.elements('ul'),
				context: {
					feed: newFeed,
					title: title,
					feedView: reverse('rss_reader-view', [newFeed.fields.url])
				}
			});
		},
		add: function(request, args){
			var newFeedUrl= args[0],
				newFeed= Feed.objects.create({
					fields: {
						url: newFeedUrl
					}
				}),
				title= '';
			
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
			var feedUrl= args[0],
				content= $('#content'),
				Template= broke.template.Template;
			
			$.jGFeed(feedUrl, function(feeds){
				if(!feeds){
					return false;
				}
				content.empty();
				
				feeds.entries.each(function(){
					var template= new Template(rss_reader.templates.feedView),
						feed= template.render({
						feed: this
					});
					
					content.append(feed);
				});
			}, 10);
			
			return {};
		}
	};
	
	// urls
	rss_reader.urlPatterns= [
		['^/rss_reader/', [
			['view_form/$', rss_reader.views.viewForm, 'view_form'],
			['save/$', rss_reader.views.save, 'save'],
			['add/(.*)$', rss_reader.views.add, 'add'],
			['view/(.*)$', rss_reader.views.view, 'view'],
			['add_feed_element/([0-9]+)/(.*)/$', rss_reader.views.addFeedElement, 'add_feed_element']
		], 'rss_reader']
	];
	broke.extend(broke.urlPatterns, rss_reader.urlPatterns);
	
	// templates
	rss_reader.templates= {
		feedElement: 	'<li rel="feed_{{ feed.pk }}">\
							<a href="#{{ feedView }}">{{ title }}</a>\
						</div>',
		feedView: 	'<div>\
						<h3><a href="{{ feed.link }}">{{ feed.title }}</a><h3>\
						<strong> {{ feed.publishedDate }} - {{ feed.author }} <strong>\
						<div style="margin-bottom:20px;border-bottom: 5px solid #ccc;">{{ feed.content }}</div>\
					</div>'
	};
})();

$(function(){
	var reverse= broke.urlResolvers.reverse;
	
	broke.extend(broke.conf.settings, {
		SAVE: {
			commit: false
		}
	});
	
	// add some content...
	broke.request(reverse('rss_reader-add', ['http://github.com/brokenseal.atom']));
});
