
Paths = new Meteor.Collection("paths");

paper.install(window);

Template.canvas.paths = function () {
	
	return Paths.find();
};


Template.header.rendered = function () {
	
	var canvas = $('#logo');
	
	canvas.svg();
	
	var svg = canvas.svg('get');
	
	svg.circle(40, 40, 25, {fill: 'none', stroke: 'red', strokeWidth: 1});
	
	//var path = svg.createPath(); 
	

};

Template.header.events({
	
	'mouseover #logo': function(event){}
});



Template.canvas.rendered = function () {
	
	paper.setup('canvas');

	// Create a simple drawing tool:
	var tool = new Tool();
	var path;
	
	// Define a mousedown and mousedrag handler
	tool.onMouseDown = function(event) {

		path = new Path();
		 
		path.strokeColor = 'red';

		path.add(event.point);
	}

	tool.onMouseDrag = function(event) {
		
		path.add(event.point);
	}

	tool.onMouseUp = function(event) {
		
		// When the mouse is released, simplify it:
				
		path.simplify(10);
		
		var p = path.exportSvg();
		
		var d = $(p).attr('d');
		
		console.log(d);
		
		Paths.insert({d:d}, function(err, id){
			console.log(id);
		});
	}
	
	
	//var d = 'M319,276 c-21.74262,0 -67.62168,50.45878 -77,66 c-13.09519,21.7006 -20.46856,49.2799 -24,74 c-2.25769,15.80383 -7.87183,51.12817 7,66 c24.17337,24.17337 68.00358,28.99809 98,13 c3.63614,-1.93927 47.17752,-28.74771 37,-38 c-7.12855,-6.4805 -30.45275,-4.51969 -35,-4 c-35.58043,4.06634 -34.55097,64.00364 -30,86 c3.02404,14.61619 11.09586,27.76706 18,41 c44.07041,84.46829 94.90192,138.17053 183,173';
	
	var path = new Path();
	
	path.strokeColor = 'red';
	
	path.add(new Point(0,0));
	path.add(new Point(0,5));
	path.add(new Point(10,10));
	path.smooth();

	var p = path.exportSvg();
	
	path.remove();
				
	var paths = Template.canvas.paths();

	paths.forEach(function (path_data) {
		
		var d = path_data.d;
		
		$(p).attr('d', d);
	
		$(p).attr('style', 'fill: none; stroke: red; stroke-width: 1');
			
		path = project.importSvg($(p)[0]);		
	});
		
	//path.fullySelected = true;
		
	paper.view.draw();	
	
};

/*
Template.canvas.events({
	
	'mousemove #canvas': function(e){canvas.draw(e)},
	'touchmove #canvas': function(e){canvas.draw(e)},
	
	'mousedown #canvas': function(e){canvas.drawStart(e)},
	'touchstart #canvas': function(e){canvas.drawStart(e)},
	
	'mouseup #canvas': function(e){canvas.drawEnd(e)},
	'touchend #canvas': function(e){canvas.drawEnd(e)},
});
*/

Accounts.ui.config({
	requestPermissions: {
		facebook: ['user_likes'],
	},
	passwordSignupFields: 'EMAIL_ONLY'
});

