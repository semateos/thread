

paper.install(window);

Paths = new Meteor.Collection("paths");


//router to handle setting the position and browser history

var Router = Backbone.Router.extend({

	routes: {
		"": "index", 
		":x,:y": "position", // #go to a coordinate
	},

	index: function(){

		self.set_position(new Point(0,0));
	},

	position: function(x,y) {
		
		eval("var point = new Point(" + x + ',' + y + ")");
		
		//console.log('location: ' + point);

		self.set_position(point);
	}
});

var router = new Router;

Meteor.startup(function () {

//  Backbone.history.start({pushState: true});

});

Template.share.point = function(){

	return Session.get("current_point");
}

Template.share.rendered = function(){

	Socialite.load('#share');
}

Template.header.rendered = function () {
	
	var canvas = $('#logo');
	
	canvas.svg();
	
	var svg = canvas.svg('get');
	
	svg.circle(30, 30, 20, {fill: 'none', stroke: 'red', strokeWidth: 1});
};

Template.header.events({
	
	'touchstart h1, click #logo, touchstart h1, click h1': function(event){

		event.preventDefault();
		event.stopPropagation();

		projects[0].view.zoom = 1;
		projects[1].view.zoom = 1;

		router.navigate('', {trigger: true});
	}	
});

Template.canvas.events({

	'touchstart .tool, click .tool': function(event){

		event.preventDefault();
		event.stopPropagation();

		var current_tool = $(event.currentTarget);

		var tool_id = current_tool.attr('id');

		$('#tools li').removeClass('selected');

		current_tool.addClass('selected');

		project.activeLayer.selected = false;

		self.selected_item = false;

		var $canvas = $('#canvas');
		var $canvas2 = $('#canvas2');
		var $svg = $('#svg');

		project.view.draw();

		if(tool_id == 'select_tool'){

			$canvas.hide();

		}else{

			$canvas.show();
		}

		eval('self.' + tool_id + '.activate()');

		self.update_selection_tools();
	},

	'touchstart #selection_delete, click #selection_delete': function(event){

		event.preventDefault();
		event.stopPropagation();

		if(self.selected_item){

			var $canvas = $('#canvas');

			var id = self.selected_item.__id;

			self.selected_item = false;

			self.update_selection_tools();

			Paths.remove({_id:id});

			$canvas.hide();
		}
	}
});

Template.canvas.rendered = function () {

	//two paper canvases, one for drawing on, one for displaying drawn elements
	//for performance reason separate canvases is better - also, I think helps with reactivity

	paper.setup('canvas'); // drawing canvas
	paper.setup('canvas2'); // data canvas

	var $canvas = $('#canvas');
	var $canvas2 = $('#canvas2');

	var $svg = $('#svg');
	$svg.svg();
	var svg = $svg.svg('get');
	
	var svg_group = svg.group();
	var $svg_group = $(svg_group);
	
	//used to keep track of paths by id or by path shape:

	var path_pointers = {}
	var active_path_pointers = {}
	
	//manage selected items

	self.selected_item = false;
	var $selection_tools = $('#selection_tools');

	//stores subscriptions to each block of canvas

	self.blocks = {}
	self.curent_blocks = {}

	//adds a subscription by rectange
	self.block_subscribe = function(left, top, right, bottom){

		var subscription = Meteor.subscribe("paths", left, top, right, bottom, function() {
			
			//console.log('subscription ready');
			/*
			var dots = new Group();
			dots.addChild(new Path.Circle(new Point(left, top), 3));
			dots.addChild(new Path.Circle(new Point(right, top), 3));
			dots.addChild(new Path.Circle(new Point(left, bottom), 3));
			dots.addChild(new Path.Circle(new Point(right, bottom), 3));
			dots.fillColor = 'red';
			*/

			svg.circle(svg_group, left, top, 3, {fill: 'red', stroke: 'none'});
			svg.circle(svg_group, right, top, 3, {fill: 'red', stroke: 'none'});
			svg.circle(svg_group, left, bottom, 3, {fill: 'red', stroke: 'none'});
			svg.circle(svg_group, right, bottom, 3, {fill: 'red', stroke: 'none'});			
		});

		return subscription;
	}

	//calculate the blocks needed for the current viewport

	self.update_blocks = function(){

		//console.log('update blocks')

		var point = projects[0].activeLayer.position;
		var bounds = projects[0].view.bounds;

		//translate the viewport by the current location
		var left = bounds.left - point.x;
		var top = bounds.top - point.y;
		var right = bounds.right - point.x;
		var bottom = bounds.bottom - point.y;

		var block_size = 500;

		//expand the current viewport and round up to the nearest block

		var block_left = Math.floor((left - block_size) / block_size)*block_size;
		var block_top = Math.floor((top - block_size) / block_size)*block_size;

		var block_right = Math.ceil((right + block_size) / block_size)*block_size;
		var block_bottom = Math.ceil((bottom + block_size) / block_size)*block_size;

		//console.log('center: ' + point);
		//console.log('view bounds: ' + left + ',' + top + ' : ' + right + ',' + bottom );
		//console.log('blocks bounds: ' + block_left + ',' + block_top + ' : ' + block_right + ',' + block_bottom);


		//divide the current viewing area into subscription blocks

		self.curent_blocks = {}

		var r = new Rectangle(block_left,block_top,block_size,block_size);

		while(r.bottom <= block_bottom){

			while(r.right < block_right){

				//console.log(r.topLeft.toString());

				var r_id = r.left + ',' + r.top;

				//if the block subscription doesn't already exisit, add it

				if(!self.blocks[r_id]){

					//console.log('new subscription');

					self.blocks[r_id] = self.block_subscribe(r.left, r.top, r.right, r.bottom);

				}else{

					//self.blocks[key].disabled = false;

					//self.blocks[r_id].start();

					//console.log('subscription exists: ' + r_id);

				}

				self.curent_blocks[r_id] = self.blocks[r_id];

				r = new Rectangle(r.left + block_size, r.top, block_size, block_size);
			}

			r = new Rectangle(block_left, r.top + block_size, block_size, block_size);
		}

		//stop and remove subscriptions outside the current area
		
		//console.log(self.blocks)
		
		
		_.each(self.blocks, function(block, key){

			if(!curent_blocks[key]){

				//console.log('removing subscription: ' + key);

				//self.blocks[key].disabled = true;

				self.blocks[key].stop();

				delete self.blocks[key];
			}
		});
	
	}


	

	//draw or undraw tools for the current selection

	self.update_selection_tools = function(){

		var offset = projects[0].activeLayer.position;

		if(self.selected_item && self.selected_item.selected){

			$selection_tools.show();

			$selection_tools.css('top', self.selected_item.bounds.y + $canvas.height()/2 + offset.y);

			$selection_tools.css('left', self.selected_item.bounds.right + $canvas.width()/2 + offset.x);

		}else{

			$selection_tools.hide();
		}
	}

	// push the current location onto the browser history stack

	self.push_position_history = function(){

		var point = projects[0].activeLayer.position.round();	

		Session.set("current_point", point);
		
		var point_text = point.x + ',' + point.y;

		router.navigate(point_text, {trigger: false});

		self.update_blocks();

		var count = 0;

		/*
		_.each(self.blocks, function(block, key){

			if(!self.curent_blocks[key]){

				count++;

				//remove excessive subscriptions?
				if(count > 50){

					console.log('removing subscription: ' + key);

					self.blocks[key].stop();

					delete self.blocks[key];
				}
			}
		});
		*/
	}

	//reposition the canvas to a point

	self.set_position = function(point){

		Session.set("current_point", point);

		projects[0].activeLayer.setPosition(point);
		//projects[1].activeLayer.setPosition(point);

		$svg_group.attr('transform', 'translate(' + point.x + ',' + point.y + ')');

		self.update_selection_tools();

		self.update_blocks();

		projects[0].view.draw();
		//projects[1].view.draw();
	}

	//reposition the canvas by a set amount

	self.translate_canvas = function(delta){

		projects[0].activeLayer.translate(delta);
		//projects[1].activeLayer.translate(delta);

		var point = projects[0].activeLayer.position;

		$svg_group.attr('transform', 'translate(' + point.x + ',' + point.y + ')');

		self.update_selection_tools();

		projects[0].view.draw();
		//projects[1].view.draw();
	}

	//if the canvas is resized maks sure the center is centered

	self.resize_view = function(){

		//$canvas[0].getContext('2d').scale(0.5,0.5);
		//$canvas2[0].getContext('2d').scale(0.5,0.5);

		/*
		var w1 = $canvas.attr('width');
		var h1 = $canvas.attr('height');

		$canvas.attr('width', w1*2);
		$canvas.attr('height', h1*2);

		$canvas2.attr('width', w1*2);
		$canvas2.attr('height', h1*2);
		*/

		var point = new Point(0,0);

		projects[0].view.center = point;
		projects[1].view.center = point;

		var width = $canvas.width();
		var height = $canvas.height();

		var svg = $svg.svg('get');
		svg.configure({viewBox: '-' + width/2 + ' -' + height/2 + ' ' + width + ' ' + height, width:width, height:height}, true);

		//projects[0].view.zoom = 2;
		//projects[1].view.zoom = 2;
	}

	self.resize_view();
	
	projects[0].view.onResize = projects[1].view.onResize = function(event) {
    	
		self.resize_view();
	}


	projects[0].activate();
	
	self.set_position(new Point(0,0));

	//console.log('canvas rendered');


	//start the history to set the inital position based on url

	Backbone.history.start({pushState: true});


	

	//start test subscriptions
	/*
	var test1 = self.block_subscribe(0,0,500,500);
	var test2 = self.block_subscribe(-500,-500,0,0);
	var test3 = self.block_subscribe(0,-500,500,0);
	var test4 = self.block_subscribe(-500,0,0,500);
	*/

	//load the data
	var paths = Paths.find();

	//prepare a svg import path element
	var path = new Path();
	
	projects[1].activate();

	path.strokeColor = 'red';
	path.add(new Point(0,0));
	path.add(new Point(0,5));
	path.add(new Point(10,10));
	path.smooth();
	
	//will be used to import svg paths
	var p = path.exportSvg();
	
	path.remove();


	


	self.remove_path = function(path_data){

		var id = path_data._id;
		var d = path_data.d;

		$('#' + id).remove();

		$('#' + id + '_hit').remove();

		delete path_pointers[id];

		if(active_path_pointers[d]){

			//console.log('remove from drawing layer');

			active_path_pointers[d].remove();

			delete active_path_pointers[d];

			//projects[0].view.draw();
		};

		if(active_path_pointers[id]){

			//console.log('remove from drawing layer');

			active_path_pointers[id].remove();

			delete active_path_pointers[id];

			//projects[0].view.draw();
		};

	}

	self.mouseover_path = function(e){

		var selected = $(this);

		var id = selected.data('id');

		$('#' + id).attr('stroke', '#0592d9');
	}

	self.mouseout_path = function(e){

		var selected = $(this);

		var id = selected.data('id');

		$('#' + id).attr('stroke', 'red');
	}

	self.click_path = function(e){

		var selected = $(this);

		var id = selected.data('id');

		projects[0].activate();

		var d = selected.attr('d');

		$(p).attr('d', d);

		$(p).attr('style', 'fill: none; stroke: red; stroke-width: 1');
			
		var path = project.importSvg($(p)[0]);

		path.__id = id;

		path.selected = true;

		self.selected_item = path;

		active_path_pointers[id]= path;

		projects[0].view.draw();

		$canvas.show();

		self.update_selection_tools();


		path_pointers[id].remove();	

		selected.remove();

		//$(this).attr('stroke', 'transparent');

	}

	self.render_path = function(path_data){

		self.remove_path(path_data);

		var id = path_data._id;
		
		var d = path_data.d;
	

		var svg_path = svg.path(svg_group, d, {fill: 'none', stroke: 'red', id: path_data._id });

		var svg_path_hit = svg.path(svg_group, d, {fill: 'none', stroke: 'transparent', id: path_data._id + '_hit', strokeWidth: 5});
		
		path_pointers[path_data._id] = svg_path;


		$p_hit = $(svg_path_hit);

		$p_hit.data('id', path_data._id);

		$p_hit.on('mouseover', self.mouseover_path);

		$p_hit.on('mouseout', self.mouseout_path);

		$p_hit.on('click', self.click_path);
	}

	//watch for path data changes
	var handle = paths.observe({

		added: function (path_data) {
			
			//console.log('added ' + path_data._id + ' : ' + path_data.d);

			if(!path_pointers[path_data._id]){

				self.render_path(path_data);
			}			
		},

		changed: function(path_data, index, old_path_data){

			self.render_path(path_data);
		},

		removed: function (path_data) {
			
			self.remove_path(path_data);
			
		}
	});
	
	/*
	setTimeout(function(){

		projects[0].view.draw();
		projects[1].view.draw();

	}, 200);
	*/

	//update or insert new paths
	self.savePath = function(path, d){

		if(!d){

			var p = path.exportSvg();
			
			d = $(p).attr('d');
		}
		
		var id = path.__id;

		var bounds = path.bounds;

		var values = {
			d:d,
			loc: [bounds.x, bounds.y],
			left:bounds.left,
			top:bounds.top,
			right:bounds.right,
			bottom:bounds.bottom,
			
		}

		if(id){

			//var result = Meteor.call('updatePath', id, values);

			Paths.update({_id:id}, {$set: values}, function(err){

				if(err){console.log(err)}
			});

		}else{

			values.owner = Meteor.userId();

			path.__id = Meteor.call('addPath', values);

			/*
			Paths.insert(values, function(id,err){
				path.__id = id;
			});
			*/
		}
	}


	// drawing tool:

	self.draw_tool = new Tool();
	var path;
	var offset;

	// Define a mousedown and mousedrag handler
	self.draw_tool.onMouseDown = function(event) {
		
		projects[0].activate();

		offset = projects[0].activeLayer.position;

		event.preventDefault();

		path = new Path();
		 
		path.strokeColor = 'red';

		path.add(event.point.subtract(offset));

		projects[0].view.draw();
	}

	self.draw_tool.onMouseDrag = function(event) {
		
		event.preventDefault();

		projects[0].activate();

		path.add(event.point.subtract(offset));

		projects[0].view.draw();
	}

	self.draw_tool.onMouseUp = function(event) {
		
		projects[0].activate();

		// When the mouse is released, simplify it:
				
		path.simplify(10);
		
		var p = path.exportSvg();
		
		var d = $(p).attr('d');
		
		active_path_pointers[d] = path;

		self.savePath(path,d);

		
	}

	//select tool

	self.select_tool = new Tool();
	var hitOptions = {
		segments: true,
		stroke: true,
		fill: true,
		tolerance: 5
	};

	var segment, path;
	var movePath = false;
	
	

	self.select_tool.onMouseDown = function(event) {
		
		event.preventDefault();

		projects[0].activate();

		var selected_item = self.selected_item;

		offset = projects[0].activeLayer.position;

		segment = path = null;

		var hitResult = project.hitTest(event.point, hitOptions);

		if (hitResult && hitResult.item){

			if(self.selected_item == hitResult.item){

				//console.log('same_item');

				if (event.modifiers.shift) {

					if (hitResult.type == 'segment') {
							hitResult.segment.remove();
							movePath = false;
					};
					return;
				}

				if (hitResult) {
					path = hitResult.item;
					self.selected_item = path;
					if (hitResult.type == 'segment') {
							segment = hitResult.segment;
							movePath = false;
					} else if (hitResult.type == 'stroke') {
							var location = hitResult.location;
							segment = path.insert(location.index + 1, event.point.subtract(offset));
							movePath = false;
							//path.smooth();
					}
				}

			}else{

				if(self.selected_item){

					if(self.selected_item.bounds.contains(event.point.subtract(offset))){

						//console.log('inside bounds');
					}

					self.savePath(selected_item);
				}

				//console.log('different_item');

				project.activeLayer.selected = false;

				self.selected_item = hitResult.item;

				movePath = self.selected_item;

				self.selected_item.selected = true;

				//console.log(selected_item._id);

			}
		}else{

			//nothing under the cursor

			if(self.selected_item){

				if(self.selected_item.bounds.contains(event.point.subtract(offset))){

					//console.log('inside bounds');
					
					movePath = self.selected_item;
				
				}else{

					self.savePath(selected_item);

					project.activeLayer.selected = false;

					self.selected_item = false;

					movePath = false;

					$canvas.hide();
				}

			}else{

				project.activeLayer.selected = false;

				self.selected_item = false;

				movePath = false;

				$canvas.hide();
			}

			
		}

		self.update_selection_tools();
	}
	
	/*
	self.select_tool.onMouseMove = function(event) {
		 
		projects[1].activate();

		if(!self.selected_item){

			var hitResult = project.hitTest(event.point, hitOptions);
			
			project.activeLayer.selected = false;
			
			self.selected_item = false;

			if (hitResult && hitResult.item){
				 	
				hitResult.item.selected = true;
			}
		}

		self.update_selection_tools();
	}
	*/

	self.select_tool.onMouseDrag = function(event) {

		projects[0].activate();

		event.preventDefault();

		//console.log('draging: ' + event.delta);
		//console.log('movePath: ' + movePath);

		if (segment) {

			segment.point = event.point.subtract(offset);
		}

		if (movePath){

			//console.log('movePath: ' + movePath.position);

			movePath.position = movePath.position.add(event.delta);

		}

		self.update_selection_tools();
	}

	
	//move tool:

	projects[0].activate;

	self.move_tool = new Tool();

	self.move_tool.onMouseDown = function(event) {

		//console.log(projects[0].activeLayer.position);
		//console.log(projects[1].activeLayer.position);

		projects[0].activate;

		event.preventDefault();
	}

	self.move_tool.onMouseDrag = function(event) {

		projects[0].activate;

		event.preventDefault();

		self.translate_canvas(event.delta);
	}

	self.move_tool.onMouseUp = function(event) {

		self.push_position_history();
	}

	self.move_tool.activate();




	//window scrolling - also repositions the canvas

	self.scroll_speed = 0.4;
	self.scroll_timer = false;

	$(window).bind('mousewheel', function(e){

		e.preventDefault();

		var wheel = e.originalEvent;

		if(wheel && wheel.wheelDelta){

			e.preventDefault();	

			var delta = new Point(wheel.wheelDeltaX*self.scroll_speed,wheel.wheelDeltaY*self.scroll_speed);

			self.translate_canvas(delta);

			clearTimeout(self.scroll_timer);

			self.scroll_timer = setTimeout( self.push_position_history , 150 );
		}
    });

	$('body').on('keydown', function(event){ 
    	
		//console.log("key" + event.which);

		if(event.which == 8 && selected_item){

			event.preventDefault();

			Paths.remove({_id:self.selected_item.__id});

			self.selected_item = false;
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




	

	

}


Accounts.ui.config({
	requestPermissions: {
		facebook: ['user_likes'],
	},
	passwordSignupFields: 'EMAIL_ONLY'
});

