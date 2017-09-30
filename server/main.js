import { Meteor } from 'meteor/meteor';

Posts = new Mongo.Collection("posts");
Events = new Mongo.Collection("events");
Deposits = new Mongo.Collection('deposits');


Meteor.startup(() => {
  // code to run on server at startup
});
