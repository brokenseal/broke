# broke.js, version 0.1.1a
A Javascript Framework inspired by the Django Web Framework (http://www.djangoproject.com/)
written by Davide Callegari - http://www.brokenseal.it/

# Help wanted
I need help with the translation from Python to Javascript.
If anyone is interested in helping out, please contact me 'cause I can't go on by myself.

WARNING: The API is under heavy development, please play around with it
but do not use it on a deployment environment.

## Broke Javascript Framework

The Broke Javascript Framework is a porting of the fantastic Django Web Framework
on Javascript. It summarizes all the best concepts present in Django like
url resolving, decoupling, DRY principle, project-specific settings and a pretty
simple template engine.
It could be put in the big Javascript MVC frameworks group outside there, but, as
Django is, this is more a MTV (Model-Template-View) framework.
Yet another Javascript MVC framework.

Please refer to the examples shipped with the release for a full understanding.

Live demo at http://demo.brokenseal.it/

You may find a distribution file inside the "dist" directory or you can roll up your
own distribution file easily with the build settings and libraries inside the "bin"
directory.

Summary
=======

For everyone of you who do not know the Django Web Framework and couldn't care less,
here is a summary of the philosophy behind Broke:

	* MTV pattern http://en.wikipedia.org/wiki/Model-Template-View
	* DRY principle (Do Not Repeat Yourself)
	* Object-relational mapping
	* Elegant URL design
	* An event system similar to the HTTP Request/Response
	* Highly configurable

Broke take advantage of the latest 'onhashchange' event, if present, and if not it
will fake one.
Generally Broke uses the 'elements' method to trigger 'broke.request' events instead
of the 'hashchange' method. Please refer to the 'events' documentation for more insight.

I'll try to summarize the pros and cons of both solutions:

    * hashchange:
    	* pros:
    		* you can bookmark the page
    		* the forward/backward buttons, changing the hash, trigger a request
    	* cons:
    		* poor control over the event happening in the page
    		* whenever a link tries asks for the same url twice, it does
    			not get intercepted twice but just once, the first time the hash changes
    			(which could both be good and bad)

    * elements:
    	* pros:
    		* you can bookmark the page
    		* more control over the event, since you can prevent default actions
    			on forms/links/whatever, like submit or visualization of the hash
    			on the page url
    		* every time you trigger a request, it gets intercepted by broke
    	* cons:
    		* the forward/backward buttons do not trigger any kind of events on
    			the page, so going backward and forward does nothing. So far
    			I could not think of a good method to prevent this

For a good understanding, please refer to the examples shipped with Broke and at the live
demo page at http://demo.brokenseal.it/

TODOs
=====

	* integrate model's fields
	* forms
	* unit tests
	* server side integration
	* a better documentation
