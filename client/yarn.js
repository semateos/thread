
Paths = new Meteor.Collection("paths");

paper.install(window);

$(function(){
	
	var shapes = Paths.find({})
	shapes.forEach(function(shape) {
		console.log('shape: ' + shape.d);	
	})	
})


/*
function drawShapes() {
	var shapes = Paths.find({})
	shapes.forEach(function(shape) {
		
		})
}

var startUpdateListener = function() {
// Function called each time 'Shapes' is updated.
		
var redrawCanvas = function() {
var context = new Meteor.deps.Context()
context.on_invalidate(redrawCanvas) // Ensures this is recalled for each update
		context.run(function() {
			drawShapes()
		})
	}
	redrawCanvas()
}

Meteor.startup(function() {
	startUpdateListener()
})


*/

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

	console.log('canvas rendered');
	
	if (! self.drawCanvas) {
		
		//redraw whenever the data changes
		self.drawCanvas = Meteor.autorun(function() {
			
			//paper.setup('canvas');
			
			var path = new Path();
			
			path.strokeColor = 'red';
			path.add(new Point(0,0));
			path.add(new Point(0,5));
			path.add(new Point(10,10));
			path.smooth();
			
			var p = path.exportSvg();
			
			path.remove();
			
			project.activeLayer.removeChildren();
			
			var paths = Paths.find().fetch(); 
			
			paths.forEach(function (path_data) {
				
				var d = path_data.d;
		
				$(p).attr('d', d);
			
				$(p).attr('style', 'fill: none; stroke: red; stroke-width: 1');
					
				path = project.importSvg($(p)[0]);
				
				//console.log(path_data.d);
			});
			
			paper.view.draw();
		});
	}
	

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
		
		//console.log(d);
		
		Paths.insert({d:d}, function(err, id){
			console.log(id);
		});
	}
	
};


Accounts.ui.config({
	requestPermissions: {
		facebook: ['user_likes'],
	},
	passwordSignupFields: 'EMAIL_ONLY'
});

