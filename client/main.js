import { Template } from 'meteor/templating';
//import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

Posts = new Mongo.Collection('posts');
Events = new Mongo.Collection('events');
Deposits = new Mongo.Collection('deposits');

contractAddr = '0xBbF02fCDb3AEc08bed5E2b3ffE9B4b4e13B89F68';
abi = [{"constant":false,"inputs":[],"name":"postRequest","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"amount","type":"uint256"}],"name":"withdraw","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"postId","type":"string"}],"name":"deletePost","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"balanceCheck","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"destroy","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"id","type":"string"}],"name":"registerPost","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"approveAccount","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"_recipient","type":"address"},{"name":"_creator","type":"bool"},{"name":"supporters","type":"uint256"}],"name":"reward","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"upVote","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":true,"stateMutability":"payable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_account","type":"address"}],"name":"AccountApproved","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_amount","type":"uint256"}],"name":"FundReceived","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_recipient","type":"address"},{"indexed":false,"name":"_amount","type":"uint256"}],"name":"FundSent","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_account","type":"address"}],"name":"AccountDeactivated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_voter","type":"address"}],"name":"Upvote","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_account","type":"address"},{"indexed":false,"name":"_id","type":"string"}],"name":"PostRegistered","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_account","type":"address"}],"name":"PostRequest","type":"event"}];
var myContract = web3.eth.contract(abi);
var myForum = myContract.at(contractAddr);


var events = myForum.allEvents();
events.watch(function(error, event){
    if (error) {
        console.log("Error: " + error);
    } else {
        console.log(event.event + ": " + JSON.stringify(event.args));
    }
});


Template.body.helpers({
	posts: function() {
		return Posts.find();
	},
    events: function() {     
        return Events.find({}, {
            limit: 10,
            sort: { created: -1 }
        });
        
    },
    contractBalance: function() {
        var total = 0;
        Deposits.find().forEach(function(obj) {
            total += parseInt(obj.money);
        })
        return total;
    },
});

Template.body.events({
	'submit .new-post': function(event) {
		var title = event.target.title.value;
		var body = event.target.body.value;
		if (title != "" && body != "") {
            console.log("sending post request");
            myForum.postRequest.call(
                function(err, res) {
                    console.log("request processed");
                    if (res) {
                        var curId = Posts.insert({
                            title: title, 
                            body: body,
                            arrowUp: false,
                            likes: 0,
                            date: new Date()
                        });
                        myForum.registerPost(curId, 
                            function(err, res) {
                                console.log("successfully registered");
                            });
                        event.target.title.value = "";
                        event.target.body.value = "";
                    } else {
                        alert("Your account is not approved.\nApprove by depositing ether");
                    }
                }
            );
		} else {
			alert("Please fill out both fields.");
		}
		
		return false;
	},
	'submit .send-ether': function(event) {
		var amount = event.target.etherAmount.value;
		weiAmount = web3.toWei(amount, "ether")
		if (amount <= 0) {
			alert("Please specify amount of ether");
		} else {
			myForum.approveAccount({value: weiAmount}, 
				function(err, res) {
                    Deposits.insert({money: amount});
				});
			event.target.etherAmount.value = "";
		}
		return false;
	}, 
	'submit .withdraw-ether': function(event) {
        var amount = event.target.etherAmount.value;
        var weiAmount = web3.toWei(amount, "ether")
        if (amount <= 0) {
            alert("Please specify positive amount of ether");
        } else {
            myForum.withdraw(weiAmount,
                function(err, res) {
                    if (res) {
                        Deposits.insert({money: 0-amount});
                    } else {
                        myForum.balanceCheck.call(
                            function(err, res) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    balance = web3.fromWei(res, 'ether');
                                    alert("You have " + balance + " ether deposited");
                                }
                        });
                    } 
                });
            event.target.etherAmount.value = "";
        }
        return false;
	}, 
});

Template.post.events({
	'click .arrow-down': function() {
		Posts.update(this._id, {$set: {arrowUp:!this.arrowUp}});
	},
	'click .delete': function() {
        var id = this._id;
        myForum.deletePost.call(id, function(err, res) {
            if (res) {
                Posts.remove(id);
                console.log("deleted post ", id);
            } else {
                alert("Not authorized to delete this post.")
            }
        });
        
	},
    'click .upvote': function(event) {
        var id = this._id;
        var orlikes = this.likes;
        myForum.upVote(function(err, res) {
            if (res) {
                Posts.update(id, {$set: {likes: orlikes+1}});
            } else {
                alert("Your account is not approved.\nApprove by depositing ether");
            }
        });
    }
});
