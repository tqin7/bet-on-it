import { Meteor } from 'meteor/meteor';

Posts = new Mongo.Collection("posts");
Events = new Mongo.Collection("events");


Meteor.startup(() => {
  // code to run on server at startup
});
