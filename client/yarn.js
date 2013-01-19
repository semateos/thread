var canvas = {}

paper.install(window);

Template.header.rendered = function () {
	
	var canvas = $('#logo');
	
	canvas.svg();
	
	var svg = canvas.svg('get');
	
	svg.circle(40, 40, 25, {fill: 'none', stroke: 'red', strokeWidth: 1});
	
	var path = svg.createPath(); 
	

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

		// Select the path, so we can see its segments:
		//path.fullySelected = true;
    }
	
	
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

