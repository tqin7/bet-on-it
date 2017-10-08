import { Meteor } from 'meteor/meteor';

Tasks = new Mongo.Collection('tasks');
Events = new Mongo.Collection('events');
const Gnosis = require('@gnosis.pm/gnosisjs');

Meteor.startup(() => {
  // code to run on server at startup
});
	