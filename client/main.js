import { Template } from 'meteor/templating';
//import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

Tasks = new Mongo.Collection('tasks');
Events = new Mongo.Collection('events');

Template.body.helpers({
    tasks: function() {
        return Tasks.find();
    }, 
});

Template.body.events({
    'submit .new-task': function(event) {
        console.log("new task submitted");
        var body = event.target.body.value;
        if (body == "" ) {
            alert("Task cannot be empty");
        } else {
            console.log("new task inserting");
            Tasks.insert({
                body: body,
                completed: false,
                upvotes: 0,
                downvotes: 0
            });
        }
        return false;
    },
});

Template.task.events({

});