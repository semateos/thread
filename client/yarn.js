var canvas = {}


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
	
	canvas.object = $('#canvas');
	
	canvas.object.svg();
	
	canvas.svg = canvas.object.svg('get');
	
	canvas.offset = canvas.object.offset();
	
	canvas.drawStart = function(e){
		this.drawing = true;
		this.path = this.svg.createPath();
		
		if(e.originalEvent && (e.originalEvent.touches || e.originalEvent.changedTouches)){
				
      		var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
      		
      		var relX = touch.pageX - this.offset.left;
			var relY = touch.pageY - this.offset.top;
			
      		//console.log(touch.pageY+' '+touch.pageX);
		
		}else{
			
			var relX = e.pageX - this.offset.left;
			var relY = e.pageY - this.offset.top;
		}
		
		this.path.move(relX,relY);
	}
	
	canvas.drawEnd = function(e){
		this.drawing = false;
	}
	
	canvas.draw = function(e){
		
		if(this.drawing){
			
			e.preventDefault();
			
			if(e.originalEvent && (e.originalEvent.touches || e.originalEvent.changedTouches)){
				
	      		var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
	      		
	      		var relX = touch.pageX - this.offset.left;
				var relY = touch.pageY - this.offset.top;
				
	      		//console.log(touch.pageY+' '+touch.pageX);
			
			}else{
				
				var relX = e.pageX - this.offset.left;
				var relY = e.pageY - this.offset.top;
			}
		
			this.svg.path(null, this.path.smoothQ(relX,relY), {fill: 'none', stroke: '#D90000', strokeWidth: 1});
			
			//this.svg.circle(relX, relY, 25, {fill: 'none', stroke: 'red', strokeWidth: 1});
			
			//console.log(relX + ' : ' + relY);
		}
	} 
};

Template.canvas.events({
	
	'mousemove #canvas': function(e){canvas.draw(e)},
	'touchmove #canvas': function(e){canvas.draw(e)},
	
	'mousedown #canvas': function(e){canvas.drawStart(e)},
	'touchstart #canvas': function(e){canvas.drawStart(e)},
	
	'mouseup #canvas': function(e){canvas.drawEnd(e)},
	'touchend #canvas': function(e){canvas.drawEnd(e)},
});


Accounts.ui.config({
	requestPermissions: {
		facebook: ['user_likes'],
	},
	passwordSignupFields: 'EMAIL_ONLY'
});

