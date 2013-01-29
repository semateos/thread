Paths = new Meteor.Collection("paths");

Meteor.publish("paths", function (left, top, right, bottom) {

	console.log("subscribe rect: " + top + "," + left);

	return Paths.find({$or: [ {$and: [ {top: {$gt: top}}, {top: {$lt: bottom}}, {left: {$gt: left}}, {left: {$lt: right}} ]}, {$and: [ {bottom: {$gt: top}}, {bottom: {$lt: bottom}}, {right: {$gt: left}}, {right: {$lt: right}} ]}] });
});


Paths.allow({
	insert: function (userId, doc) {
		// the user must be logged in, and the document must be owned by the user
		return doc.owner === userId;
	},
	update: function (userId, docs, fields, modifier) {
		// can only change your own documents
		return _.all(docs, function(doc) {

			console.log('test ownership: ' + userId + ' : ' + doc.owner);

			return doc.owner === null || doc.owner === userId;
		});
	},
	remove: function (userId, docs) {
		// can only remove your own documents
		return _.all(docs, function(doc) {
			return doc.owner === null || doc.owner === userId;
		});
	},
	fetch: ['owner','d']
});

Paths.deny({
	update: function (userId, docs, fields, modifier) {
		// can't change owners
		return _.contains(fields, 'owner');
	},
	remove: function (userId, docs) {
		// can't remove locked documents
		return _.any(docs, function (doc) {
			return doc.locked;
		});
	},
	fetch: ['locked'] // no need to fetch 'owner'
});


//add created and updated timestamps
Meteor.methods({

	addPath: function (doc) {

		doc.created = new Date(); // ms since epoch
		return Paths.insert(doc);
	},

	/*
	updatePath: function (id,values) {

		//values.updated = new Date(); // ms since epoch
		return Paths.update({_id:id}, {$set: values}, function(err){});
	},*/
});