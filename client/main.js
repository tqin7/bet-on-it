import { Template } from 'meteor/templating';
//import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

Tasks = new Mongo.Collection('tasks');
Events = new Mongo.Collection('events');



// Add the sticky class to the navbar when you reach its scroll position. Remove "sticky" when you leave the scroll position
function myFunction() {
    // Get the navbar
    var navbar = document.getElementById("navbar");
    // Get the offset position of the navbar
    var sticky = navbar.offsetTop;
  if (window.pageYOffset >= sticky) {
    navbar.classList.add("sticky")
  } else {
    navbar.classList.remove("sticky");
  }
}

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
            event.target.body.value = "";
        }
        return false;
    },
});

Template.task.events({
    'click .delete': function(event) {
        Tasks.remove(this._id);
    },
});
