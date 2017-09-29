import { Template } from 'meteor/templating';
//import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

Posts = new Mongo.Collection('posts');
Events = new Mongo.Collection('events');

//const fs = require("fs");
contractAddr = '0xBEFD679425BCe57EE0911BA78E6c768B428446Ee';
abi = [ { constant: false,
    inputs: [ [Object] ],
    name: 'deletePost',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
    signature: '0x094cd5ee' },
  { constant: false,
    inputs: [ [Object] ],
    name: 'registerPost',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
    signature: '0x1c951250' },
  { constant: false,
    inputs: [],
    name: 'postRequest',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
    signature: '0x225dda53' },
  { constant: false,
    inputs: [],
    name: 'withdraw',
    outputs: [ [Object] ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
    signature: '0x3ccfd60b' },
  { constant: false,
    inputs: [],
    name: 'destroy',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
    signature: '0x83197ef0' },
  { constant: false,
    inputs: [],
    name: 'approveAccount',
    outputs: [],
    payable: true,
    stateMutability: 'payable',
    type: 'function',
    signature: '0x9e5e5b68' },
  { constant: false,
    inputs: [ [Object], [Object], [Object] ],
    name: 'reward',
    outputs: [ [Object] ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
    signature: '0xbdf6907d' },
  { constant: false,
    inputs: [],
    name: 'upVote',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
    signature: '0xeed7c128' },
  { inputs: [],
    payable: true,
    stateMutability: 'payable',
    type: 'constructor',
    signature: 'constructor' },
  { payable: true, stateMutability: 'payable', type: 'fallback' },
  { anonymous: false,
    inputs: [ [Object] ],
    name: 'AccountApproved',
    type: 'event',
    signature: '0xbc7abdf8533487db28f8c616affbb4e122d90c5ab8deb258fd21b09cee595730' },
  { anonymous: false,
    inputs: [ [Object] ],
    name: 'FundReceived',
    type: 'event',
    signature: '0xa0d9716a1b7e5a3d361b0aff5b4ac71d21ba9a2cffe7c41d684d3d12d8f8c508' },
  { anonymous: false,
    inputs: [ [Object], [Object] ],
    name: 'FundSent',
    type: 'event',
    signature: '0x228867b0ebf23ada4ac001990d80ed59681ae5e0dfd98f49c70d5bc224240fec' },
  { anonymous: false,
    inputs: [ [Object] ],
    name: 'AccountDeactivated',
    type: 'event',
    signature: '0x21831c2238658baa66ab1895cb18bdeaf2bea535a3df6126b7ada38425748375' },
  { anonymous: false,
    inputs: [ [Object] ],
    name: 'Upvote',
    type: 'event',
    signature: '0x3c61bd115078be418fc54c0576aedde0714d9fe6e1829cc7d57fcaab45e6a5eb' },
  { anonymous: false,
    inputs: [ [Object], [Object] ],
    name: 'PostRegistered',
    type: 'event',
    signature: '0x472c781940a78a3f6869d289277d9a5bd51de8e603b13535987dd5dd8129aa1d' },
  { anonymous: false,
    inputs: [ [Object] ],
    name: 'PostRequest',
    type: 'event',
    signature: '0x2d645b9ef46a25e3a0066be653c1f52fe444bb261bde3e6a6257f8def714be15' },
  { anonymous: false,
    inputs: [ [Object] ],
    name: 'PostDeleted',
    type: 'event',
    signature: '0x32d67e2131cd025eb20e7256680e338dedbe17b28943a11681860a9271ad119d' } ];
var myContract = web3.eth.contract(abi);
var myForum = myContract.at(contractAddr);

/*
var events = myForum.allEvents();
var FundReceived = myForum.FundReceived({}, {fromBlock: 0, toBlock: 'latest'});
FundReceived.watch(function(err, e) {
    if (err) {
        console.log(err);
    } else {
        console.log('FundReceived');
    }
});
events.watch(function(error, event){
    if (error) {
        console.log("Error: " + error);
    } else {
        console.log(event.event + ": " + JSON.stringify(event.args));
    }
});
myForum.FundReceived().watch(function(err, rs) {
    console.log(res);
})
myForum.FundSent().watch(function(err, rs) {
    console.log(res);
})
*/

idTracker = 1;

Template.body.helpers({
	posts: function() {
		return Posts.find();
	},
    events: function() {
        console.log("obtaining events");        
        return Events.find({}, {
            limit: 10,
            sort: { created: -1 }
        });
        
    },
});

Template.body.events({
	'submit .new-post': function(event) {
		var title = event.target.title.value;
		var body = event.target.body.value;
        console.log("register post sent");
		if (title != "" && body != "") {
            console.log("sending post request");
            myForum.postRequest(
                function(err, res) {
                    console.log("request processed");
                    if (res) {
                        var curId = Posts.insert({
                            title: title, 
                            body: body,
                            arrowUp: false,
                            likes: 0,
                            pseudoId: idTracker,
                            date: new Date()
                        });
                        console.log(curId);
                        /*
                        myForum.registerPost(1, 
                            function(err, res) {
                                console.log("successfully registered");
                            });
                        */
                        event.target.title.value = "";
                        event.target.body.value = "";
                        console.log("idTracker is " + idTracker);
                        idTracker += 1;
                    } else {
                        alert("Your account is not approved.\n Approve by depositing ether");
                        return false
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
		amount = web3.toWei(amount, "ether")
		if (amount <= 0) {
			alert("Please specify amount of ether");
		} else {
			myForum.approveAccount({value: amount}, 
				function(err, res) {
					console.log(res);
				});
			event.target.etherAmount.value = "";
		}
		return false;
	}, 
	'click #withdraw': function() {
		console.log("withdraw initiated");
		myForum.withdraw(
			function(err, res) {
				console.log(res);
			});
	}, 
});

Template.post.events({
	'click .arrow-down': function() {
		Posts.update(this._id, {$set: {arrowUp:!this.arrowUp}});
		console.log("updated arrowUp");
	},
	'click .delete': function() {
        var id = this._id;
        var pseuId = this.pseudoId;
        console.log("delete sending");
        Posts.remove(id);
        /*
        myForum.deletePost(pseuId, function(err, res) {
            if (res) {
                Posts.remove(id);
                console.log("deleted post ", id);
            } else {
                alert("Not authorized to delete this post.")
            }
        });
        */
	},
    'click .upvote': function(event) {
        console.log("upvote clicked");
        var id = this._id;
        console.log("ID is " + id);
        var orlikes = this.likes;
        myForum.upVote(function(err, res) {
            console.log("result from upvote returned: " + res);
            if (res) {
                console.log("updating likes");
                Posts.update(id, {$set: {likes: orlikes+1}});
            } else {
                alert("Your account is not approved.\n Approve by depositing ether");
            }
        });
    }
});
