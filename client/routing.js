/*
var Router = Backbone.Router.extend({
 	
 	renderTemplate: function(template){
	
		$('body').html(Meteor.render(function () {return template();}));
	},
 	
 	routes: {
		"": 		"index",
		"login": 	"login",
	},

	index: function() {
  	
		this.renderTemplate(Template.index);
	},

	login: function() {
  	
  		this.renderTemplate(Template.login);
	},
});

var app = new Router;
Meteor.startup(function () {
  Backbone.history.start({pushState: true});
});
*/