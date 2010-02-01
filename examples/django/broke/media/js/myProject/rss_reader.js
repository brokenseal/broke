(function(){
	// models
	var Model= broke.models.Model,
		rss_reader= myProject.apps.rss_reader,
		reverse= broke.urlResolvers.reverse;
	
	// Feed
	Model.extend("myProject.apps.rss_reader.models.Feed", {
		init: function(){
			this.appLabel= 'rss_reader';
			this.tableName= "%s_%s".echo(this.appLabel, this.className.lower());
			
			this._super();
		},
		incrementalPk: 1
	},{
		init: function(args){
			args.pk= this.Class.incrementalPk++;
			this._super(args);
		}
	});
	
	// views
	rss_reader.views= {
		add: function(request, args){
			var newFeedUrl= args[0],
				Feed= myProject.apps.rss_reader.models.Feed,
				newFeed= Feed.objects.create({
					fields: {
						url: newFeedUrl
					}
				});
			
			return {
				operation: 'create',
				template: rss_reader.templates.feedElement,
				htmlNode: newFeed.Class.elements('ul'),
				context: {
					feed: newFeed,
					feedView: reverse('rss_reader-view', [newFeed.fields.url])
				}
			};
		},
		view: function(request, args){
			var feedUrl= args[0],
				content= $('#content');
			
			$.jGFeed(feedUrl, function(feeds){
				if(!feeds){
					return false;
				}
				content.empty();
				
				feeds.entries.each(function(){
					var feed= rss_reader.templates.feedView.render({
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
			['add/(.*)$', rss_reader.views.add, 'add'],
			['view/(.*)$', rss_reader.views.view, 'view'],
		], 'rss_reader']
	];
	broke.extend(broke.urlPatterns, rss_reader.urlPatterns);
	
	// templates
	rss_reader.templates= {
		feedElement: 	'<li rel="feed_{{ feed.pk }}">\
							<a href="#{{ feedView }}">__{{ feed.fields.pk }}__</a>\
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
	
	broke.extend(broke.settings, {
		save: {
			commit: false
		}
	});
	
	// add some content...
	$(window).trigger('broke.request', [{
		url: reverse('rss_reader-add', ['http://github.com/brokenseal.atom'])
	}]);
	
/*	$(window).trigger('broke.request', [{
		url: reverse('rss_reader-view', [myFeed.pk])
	}]);*/
});






