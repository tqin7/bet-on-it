import { Template } from 'meteor/templating';
//import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

Tasks = new Mongo.Collection('tasks');
Events = new Mongo.Collection('events');

contractAddr = '0xE0374Bc9f86CF59BD402d581d53340A79441d86A';
abi = [{"constant":false,"inputs":[{"name":"amount","type":"uint256"}],"name":"withdraw","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"pushRequest","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"id","type":"string"}],"name":"downVote","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"balanceCheck","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"vote","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalFundGetter","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"id","type":"string"},{"name":"supportersWin","type":"bool"}],"name":"settle","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"destroy","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"approveAccount","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"id","type":"string"}],"name":"upVote","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"id","type":"string"}],"name":"pushTask","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"inputs":[],"payable":true,"stateMutability":"payable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_voter","type":"address"}],"name":"Vote","type":"event"}];
var myContract = web3.eth.contract(abi);
var ctr = myContract.at(contractAddr);

oneEther = web3.toWei(1, "ether");

Template.homePage.helpers({
    tasks: function() {
        return Tasks.find();
    },
});

Template.poolPage.helpers({
    tasks: function() {
        return Tasks.find();
    },
    totalFund: function() {
        ctr.totalFund().call(function(err, res) {
            return web3.fromWei(res, 'ether');
        });
    },
});

Template.poolPage.events({
    'click .upvote': function() {
        var id = this._id;
        var u = this.upvotes;
        ctr.vote(function(err, res) {
            if (res) {
                ctr.upVote(id, {value: oneEther}, 
                    function(err, res) {
                        Tasks.update(id, {$set: {upvotes: u+1}});
                    }
                );
            } else {
                alert("Your account is not approved.\nApprove by depositing ether");
            }
        });
    },
    'click .downvote': function() {
        var id = this._id;
        var d = this.downvotes;
        ctr.vote(function(err, res) {
            if (res) {
                ctr.downVote(id, {value: oneEther}, 
                    function(err, res) {
                        Tasks.update(id, {$set: {downvotes: d+1}});
                    }
                );
            } else {
                alert("Your account is not approved.\nApprove by depositing ether");
            }
        });
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
                notPushed: true
            });
            event.target.body.value = "";
        }
        return false;
    },
    'click .complete': function(event) {
        var id = this._id;
        var c = Tasks.findOne({_id: id}).completed;
        console.log("c is " + c);
        ctr.settle(id, true, function(err, res) {
            if (err) {
                console.log("Could not settle. Error is " + err);
            } else {
                Tasks.update(id, {$set: {completed: !c}}, function(err, res) {
                    if (err) {
                        console.log("errored");
                    } else {
                        console.log("c now is " + !c);
                    }
                });
            }
        });
    },
    'submit .send-ether': function(event) {
        var amount = event.target.etherAmount.value;
        weiAmount = web3.toWei(amount, "ether");
        if (amount <= 0) {
            alert("Please specify amount of ether");
        } else {
            ctr.approveAccount({value: weiAmount}, 
                function(err, res) {
                    if (res) {
                        console.log("account approved");
                    } else {
                        console.log("error when approving account");
                    }
                });
            event.target.etherAmount.value = "";
        }
        return false;
    }, 
    'submit .withdraw-ether': function(event) {
        var amount = event.target.etherAmount.value;
        var weiAmount = web3.toWei(amount, "ether");
        if (amount <= 0) {
            alert("Please specify positive amount of ether");
        } else {
            ctr.withdraw(weiAmount,
                function(err, res) {
                    if (res) {
                        console.log("success");
                    } else {
                        ctr.balanceCheck.call(
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

Template.task.events({
    'click .delete': function(event) {
        Tasks.remove(this._id);
    },
    'click .push': function(event) {
        var id = this._id;
        ctr.pushRequest.call(
            function(err, res) {
                console.log("push request processed");
                if (res) {
                    ctr.pushTask(id, {value: oneEther},
                        function(err, res) {
                            if (res) {
                                Tasks.update(id, {$set: {notPushed: false}}, function(err, res) {
                                    if (err) {
                                        console.log("errored");
                                    } else {
                                        console.log("Task pushed");
                                    }
                                });
                            }
                        }
                    );
                } else {
                    alert("Push to Pool needs account approval.\nApprove by depositing ether");
                }
            }
        );
    },

});
