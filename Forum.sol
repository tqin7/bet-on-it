pragma solidity ^0.4.11;

contract Forum {
	struct User {
		uint deposit;
		bytes32[] posts;
	}

	address private creator;
	mapping(address => User) users;
	uint totalFund;
	uint numActive;

	event AccountApproved(address _account);
	event FundReceived(uint _amount);
	event FundSent(address _recipient, uint _amount);
	event AccountDeactivated(address _account);
	event Upvote(address _voter);
	event PostRegistered(address _account, bytes32 _id);
	event PostRequest(address _account);
	event PostDeleted(bytes32 _id);

	modifier onlyBy(address _account) {
		require(msg.sender == _account);
		_;
	}

	modifier hasValue() {
		require(msg.value > 0);
		_;
	}

	modifier approved(address _account) {
		require(users[_account].deposit > 0);
		_;
	}

	modifier createdPost(address _account, bytes32 _id) {
		bool approve = false;
		for (uint i = 0; i < users[_account].posts.length; i++) {
			if (_id == users[_account].posts[i]) {
				approve = true;
				break;
			}
		}
		require(approve == true);
		_;
	}

	function Forum() public payable {
		creator = msg.sender;
		totalFund = 0;
		numActive = 1;
		users[creator].deposit = msg.value;
	}

	function approveAccount() external payable hasValue {
		numActive += 1;
		totalFund += msg.value;
		users[msg.sender.deposit += msg.value;

		AccountApproved(msg.sender);
		FundReceived(msg.value);
	}

	function postRequest() external approved(msg.sender) {
		PostRequest(msg.sender);
	}

	function registerPost(bytes32 id) external approved(msg.sender) {
		users[msg.sender].posts.push(id);
		PostRegistered(msg.sender, id);
	}

	function upVote() external approved(msg.sender) {
		Upvote(msg.sender);
	}

	function reward(address _recipient, bool _creator, uint supporters) external onlyBy(creator) returns (bool) {
		uint amount = users[_recipient].deposit * users[_recipient].deposit / totalFund;
		if (!_creator) {
			amount = amount / supporters;
		}
		if (!_recipient.send(amount)) {
			return false;
		}
		FundSent(_recipient, amount);
		return true;
	}

	function withdraw() external approved(msg.sender) returns (bool) {
		uint amount = users[msg.sender].deposit;
		if (!msg.sender.send(amount)) {
			return false;
		}
		totalFund -= amount;
		users[msg.sender].deposit = 0;
		AccountDeactivated(msg.sender);
	}

	function deletePost(bytes32 postId) external approved(msg.sender) createdPost(msg.sender, postId) {
		for (uint i = 0; i < users[_account].posts.length; i++) {
			if (_id == users[_account].posts[i]) {
				users[_account].posts[i] = "";
				break;
			}
		}
		PostDeleted(postId);
	}

	function() public payable {
		users[msg.sender].deposit += msg.value;
		totalFund += msg.value;
		FundReceived(msg.value);
	}

	function destroy() public onlyBy(creator) {
		require(numActive == 1);
		selfdestruct(creator);
	}
}