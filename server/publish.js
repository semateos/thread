Paths = new Meteor.Collection("paths");

Meteor.publish("allpaths", function () {
  return Paths.find({});
});