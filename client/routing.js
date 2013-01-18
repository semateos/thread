var Router = Backbone.Router.extend({
 	
 	renderTemplate: function(template){
	
		$('body').html(Meteor.render(function () {return template();}));
	},
 	
 	routes: {
		"": 		"index",
		"books": 	"books",
	},

	index: function() {
  	
		this.renderTemplate(Template.index);
	},

	books: function() {
  	
  		this.renderTemplate(Template.books);
	},
});

var app = new Router;
Meteor.startup(function () {
  Backbone.history.start({pushState: true});
});