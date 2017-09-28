import { Template } from 'meteor/templating';
//import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

Posts = new Mongo.Collection('posts');

const fs = require("fs");
//const solc = require('solc');
contractAddr = '0xD0E6DB11747A682189CAB1d014e2fC5528A3A36b';
abi = [ { constant: false,
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
  { constant: true,
    inputs: [],
    name: 'upVote',
    outputs: [ [Object] ],
    payable: false,
    stateMutability: 'view',
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
    signature: '0x21831c2238658baa66ab1895cb18bdeaf2bea535a3df6126b7ada38425748375' } ];
var myContract = web3.eth.contract(abi);
var myForum = myContract.at(contractAddr);

Template.body.helpers({
	posts: function() {
		return Posts.find();
	},
});

Template.body.events({
	'submit .new-post': function(event) {
		var title = event.target.title.value;
		var body = event.target.body.value;
		if (title != "" && body != "") {
			Posts.insert({
				title: title, 
				body: body,
				arrowUp: false,
				date: new Date()
			});

			event.target.title.value = "";
			event.target.body.value = "";
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
			/*
			web3.eth.sendTransaction(
				{to: myForum.address,
				value: web3.toWei(amount, "ether")}, 
				function(err, res) {
					console.log(res);
				});
			*/
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
		Posts.remove(this._id);
		console.log("deleted post ", this._id);
	},
});
