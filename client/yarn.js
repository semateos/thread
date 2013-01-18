Template.index.rendered = function () {
	
	var canvas = $('#canvas');
	
	canvas.svg();
	
	var svg = canvas.svg('get');
	
	svg.circle(40, 40, 25, {fill: 'none', stroke: 'red', strokeWidth: 3});
};

Accounts.ui.config({
	requestPermissions: {
		facebook: ['user_likes'],
	},
	passwordSignupFields: 'EMAIL_ONLY'
});

