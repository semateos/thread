paper.install(window);

Paths = new Meteor.Collection("paths");

Template.header.rendered = function () {
	
	var canvas = $('#logo');
	
	canvas.svg();
	
	var svg = canvas.svg('get');
	
	svg.circle(30, 30, 20, {fill: 'none', stroke: 'red', strokeWidth: 1});


};

Template.header.events({
	
	'click #logo': function(event){
		projects[1].activeLayer.removeChildren();
		Paths.remove({}); 
	}
});



Template.canvas.rendered = function () {

	paper.setup('canvas');
	paper.setup('canvas2');

	projects[0].view.center = new Point(0,0);
	projects[1].view.center = new Point(0,0);

	projects[0].view.onResize = function(event) {
    	
	    projects[0].view.center = new Point(0,0);
		projects[1].view.center = new Point(0,0);
	}

	projects[0].activate();
	

	console.log('canvas rendered');

	var path_pointers = {}
	var active_path_pointers = {}

	// Create a simple drawing tool:
	var draw_tool = new Tool();
	var path;
	
	// Define a mousedown and mousedrag handler
	draw_tool.onMouseDown = function(event) {
		
		projects[0].activate();

		event.preventDefault();

		path = new Path();
		 
		path.strokeColor = 'red';

		path.add(event.point);

		projects[0].view.draw();
	}

	draw_tool.onMouseDrag = function(event) {
		
		projects[0].activate();

		//event.preventDefault();

		path.add(event.point);

		projects[0].view.draw();
	}

	draw_tool.onMouseUp = function(event) {
		
		projects[0].activate();

		// When the mouse is released, simplify it:
				
		path.simplify(10);
		
		var p = path.exportSvg();
		
		var d = $(p).attr('d');
		
		active_path_pointers[d] = path;

		self.savePath(path,d);

		
	}

	projects[1].activate();

	// Create a simple drawing tool:
	var select_tool = new Tool();
	var hitOptions = {
		segments: true,
		stroke: true,
		fill: true,
		tolerance: 5
	};

	

	var segment, path;
	var movePath = false;
	var selected_item = false;
	var selected_list = new Array();


	
	select_tool.onMouseDown = function(event) {
			
		event.preventDefault();

		segment = path = null;

		var hitResult = project.hitTest(event.point, hitOptions);

		if (hitResult && hitResult.item){

			if(selected_item == hitResult.item){

				console.log('same_item');

				if (event.modifiers.shift) {

					if (hitResult.type == 'segment') {
							hitResult.segment.remove();
					};
					return;
				}

				if (hitResult) {
					path = hitResult.item;
					selected_item = path;
					if (hitResult.type == 'segment') {
							segment = hitResult.segment;
					} else if (hitResult.type == 'stroke') {
							var location = hitResult.location;
							segment = path.insert(location.index + 1, event.point);
							path.smooth();
					}
				}

			}else{

				if(selected_item){

					self.savePath(selected_item);
				}

				console.log('different_item');

				project.activeLayer.selected = false;

				selected_item = hitResult.item;

				selected_item.selected = true;

				console.log(selected_item._id);

			}
		}else{

			if(selected_item){

				self.savePath(selected_item);
			}

			project.activeLayer.selected = false;

			selected_item = false;
		}
	}
	

	select_tool.onMouseMove = function(event) {
		 
		projects[1].activate();

		if(!selected_item){

			var hitResult = project.hitTest(event.point, hitOptions);
			
			project.activeLayer.selected = false;
			
			selected_item = false;

			if (hitResult && hitResult.item){
				 	
				hitResult.item.selected = true;
			}
		}
	}

	select_tool.onMouseDrag = function(event) {

		event.preventDefault();

			if (segment) {
					segment.point = event.point;
					path.smooth();
			}

			if (movePath)
					path.position += event.delta;
	}


	$('body').on('keydown', function(event){ 
    	
		event.preventDefault();

		console.log("key" + event.which);

		if(event.which == 8 && selected_item){

			event.preventDefault();

			Paths.remove({_id:selected_item.__id});

			selected_item = false;
    	}

    	if(event.which == 187){

    		projects[0].view.zoom += 0.5;
    		projects[1].view.zoom += 0.5;

    		projects[0].view.center = new Point(0,0);
			projects[1].view.center = new Point(0,0);
    	}

    	if(event.which == 189){

    		projects[0].view.zoom = 1;
    		projects[1].view.zoom = 1;

    		projects[0].view.center = new Point(0,0);
			projects[1].view.center = new Point(0,0);
    	}
    });	




	
	
	//redraw whenever the data changes
	self.drawCanvas = Meteor.subscribe("allpaths", function() {
		
		console.log('subscription ready');

		projects[1].activate();

		var path = new Path();
		
		path.strokeColor = 'red';
		path.add(new Point(0,0));
		path.add(new Point(0,5));
		path.add(new Point(10,10));
		path.smooth();
		
		var p = path.exportSvg();
		
		path.remove();
		
		
		projects[1].activeLayer.removeChildren();

		//layer1.removeChildren();
		
		var paths = Paths.find();

		var handle = paths.observe({

			added: function (path_data) {

				console.log('added ' + path_data._id + ' : ' + path_data.d);

				projects[1].activate();

				var d = path_data.d;
		
				$(p).attr('d', d);
			
				$(p).attr('style', 'fill: none; stroke: red; stroke-width: 1');
					
				var path = project.importSvg($(p)[0]);
				
				path.__id = path_data._id;

				path_pointers[path_data._id] = path;

				if(active_path_pointers[d]){

					console.log('remove from drawing layer');

					active_path_pointers[d].remove();
				};

				projects[1].view.draw();
				projects[0].view.draw();

			},

			changed: function(path_data, index, old_path_data){

				if(old_path_data.d != path_data.d){

					console.log('updated ' + path_data._id + ' : ' + path_data.d);

					projects[1].activate();

					var path = path_pointers[path_data._id];

					if(path){

						path.remove();	
					}
				
					var d = path_data.d;
			
					$(p).attr('d', d);
				
					$(p).attr('style', 'fill: none; stroke: red; stroke-width: 1');
						
					path = project.importSvg($(p)[0]);
					
					path.__id = path_data._id;

					path_pointers[path_data._id] = path;

					projects[1].view.draw();
				}

			},

			removed: function (path_data) {
				
				console.log('removed ' + path_data.d);

				var path = path_pointers[path_data._id];

				if(path){
					
					path.remove();	
				}

				projects[1].view.draw();
				
			}
		});
	});
	
	
	self.savePath = function(path, d){

		if(!d){

			var p = path.exportSvg();
			
			d = $(p).attr('d');
		}
		
		var id = path.__id;

		var bounds = path.bounds;

		var values = {
			d:d,
			x:bounds.x,
			y:bounds.y,
			x2:bounds.x + bounds.width,
			y2:bounds.y + bounds.height,
			width:bounds.width,
			height:bounds.height
		}

		if(id){

			Paths.update({_id:id}, {$set: values}, function(err){});

		}else{

			Paths.insert(values, function(id,err){
				path.__id = id;
			});
		}
	}

	$('#tools li').on('click', function(event){

		var current_tool = $(this);

		var tool_id = current_tool.attr('id');

		$('#tools li').removeClass('selected');
		
		current_tool.addClass('selected');

		project.activeLayer.selected = false;

		selected_item = false;

		project.view.draw();

		if(tool_id == 'select_tool'){

			$('#canvas').hide();

		}else{

			$('#canvas').show();
			
		}

		eval(tool_id + '.activate()');
	})

}


Accounts.ui.config({
	requestPermissions: {
		facebook: ['user_likes'],
	},
	passwordSignupFields: 'EMAIL_ONLY'
});

