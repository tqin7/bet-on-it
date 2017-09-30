pragma solidity ^0.4.11;

contract Forum {

	address private creator;
	mapping(address => uint) deposits;
	mapping(string => address) posts;
	uint totalFund;
	uint numActive;

	event AccountApproved(address _account);
	event FundReceived(uint _amount);
	event FundSent(address _recipient, uint _amount);
	event AccountDeactivated(address _account);
	event Upvote(address _voter);
	event PostRegistered(address _account, string _id);
	event PostRequest(address _account);

	modifier onlyBy(address _account) {
		require(msg.sender == _account);
		_;
	}

	modifier hasValue() {
		require(msg.value > 0);
		_;
	}

	modifier approved(address _account) {
		require(deposits[_account] > 0);
		_;
	}

	modifier enoughBalance(uint amount, address _account) {
		require(amount <= deposits[_account]);
		_;
	}

	function Forum() public payable {
		creator = msg.sender;
		totalFund = 0;
		numActive = 1;
		deposits[creator] = msg.value;
	}

	function approveAccount() external payable hasValue {
		numActive += 1;
		totalFund += msg.value;
		deposits[msg.sender] += msg.value;

		AccountApproved(msg.sender);
		FundReceived(msg.value);
	}

	function postRequest() external returns (bool) {
		PostRequest(msg.sender);
		return deposits[msg.sender] > 0;
	}

	function registerPost(string id) external approved(msg.sender) {
		posts[id] = msg.sender;
		PostRegistered(msg.sender, id);
	}

	function upVote() external approved(msg.sender) {
		Upvote(msg.sender);
	}

	function reward(address _recipient, bool _creator, uint supporters) external onlyBy(creator) returns (bool) {
		uint amount = deposits[_recipient] * deposits[_recipient] / totalFund;
		if (!_creator) {
			amount = amount / supporters;
		}
		if (!_recipient.send(amount)) {
			return false;
		}
		FundSent(_recipient, amount);
		return true;
	}

	function withdraw(uint amount) external approved(msg.sender) enoughBalance(amount, msg.sender) returns (bool) {
		if (!msg.sender.send(amount)) {
			return false;
		}
		totalFund -= amount;
		deposits[msg.sender] -= amount;
		if (deposits[msg.sender] == 0) {
			numActive -= 1;
			AccountDeactivated(msg.sender);
		}
	}

	function deletePost(string postId) external approved(msg.sender) returns (bool) {
		if (posts[postId] == msg.sender) {
			return true;
		} else {
			return false;
		}
	}

	function balanceCheck() constant returns (uint) {
		return deposits[msg.sender];
	}

	function() public payable {
		deposits[msg.sender] += msg.value;
		totalFund += msg.value;
		FundReceived(msg.value);
	}

	function destroy() public onlyBy(creator) {
		require(numActive == 1);
		selfdestruct(creator);
	}
}