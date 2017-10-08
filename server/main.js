import { Meteor } from 'meteor/meteor';

Tasks = new Mongo.Collection('tasks');
Events = new Mongo.Collection('events');

Meteor.startup(() => {
  // code to run on server at startup
});
