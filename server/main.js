import { Meteor } from 'meteor/meteor';

Posts = new Mongo.Collection("posts");

Meteor.startup(() => {
  // code to run on server at startup
});
