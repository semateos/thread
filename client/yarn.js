

Template.header.events({
	
	'click input' : function () {
		// template data, if any, is available in 'this'
		alert(Meteor.user().profile.name);
	}	
});

Accounts.ui.config({
	requestPermissions: {
		facebook: ['user_likes'],
	},
	passwordSignupFields: 'EMAIL_ONLY'
});

