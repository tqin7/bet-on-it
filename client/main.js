import { Template } from 'meteor/templating';
//import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

Tasks = new Mongo.Collection('tasks');
Events = new Mongo.Collection('events');

// Get the navbar


// Add the sticky class to the navbar when you reach its scroll position. Remove "sticky" when you leave the scroll position
function myFunction() {
  var navbar = document.getElementById("navbar");
  // Get the offset position of the navbar
  var sticky = navbar.offsetTop;
  if (window.pageYOffset >= sticky) {
    navbar.classList.add("sticky")
  } else {
    navbar.classList.remove("sticky");
  }
}

Template.homePage.helpers({
    tasks: function() {
        return Tasks.find();
    },
});

Template.poolPage.helpers({
    tasks: function() {
        return Tasks.find();
    }, 
});

Template.homePage.events({
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
                downvotes: 0,
                pushed: false
            });
            event.target.body.value = "";
        }
        return false;
    },
    'click .task': function(event) {
        var id = this._id;
        var c = Tasks.findOne({_id: id}).completed;
        console.log("c is " + c);
        Tasks.update(id, {$set: {completed: !c}}, function(err, res) {
            if (err) {
                console.log("errored");
            } else {
                console.log("c now is " + !c);
            }
        });
    },
});

Template.task.events({
    'click .delete': function(event) {
        Tasks.remove(this._id);
    },
});
