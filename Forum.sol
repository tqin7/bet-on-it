pragma solidity ^0.4.11;

contract Forum {
	address private creator;
	mapping(address => uint) contributions;
	uint totalFund;
	uint numActive;

	event AccountApproved(address account);
	event FundReceived(uint amount);
	event FundSent(address recipient, uint amount);
	event AccountDeactivated(address account);

	modifier onlyBy(address _account) {
		require(msg.sender == _account);
		_;
	}

	modifier hasValue() {
		require(msg.value > 0);
		_;
	}

	modifier approved(address _account) {
		require(contributions[_account] > 0);
		_;
	}

	function Forum() public payable {
		creator = msg.sender;
		totalFund = 0;
		numActive = 1;
		contributions[creator] = msg.value;
	}

	function approveAccount() external payable hasValue {
		numActive += 1;
		totalFund += msg.value;
		contributions[msg.sender] += msg.value;

		AccountApproved(msg.sender);
		FundReceived(msg.value);
	}

	function upVote() external view approved(msg.sender) returns (uint8){
		return 1;
	}

	function reward(address _recipient, bool _creator, uint supporters) external onlyBy(creator) returns (bool) {
		uint amount = contributions[_recipient] * contributions[_recipient] / totalFund;
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
		uint amount = contributions[msg.sender];
		if (!msg.sender.send(amount)) {
			return false;
		}
		totalFund -= amount;
		contributions[msg.sender] = 0;
		AccountDeactivated(msg.sender);
		return true;
	}

	function() public payable {
		contributions[msg.sender] += msg.value;
		totalFund += msg.value;
		FundReceived(msg.value);
	}

	function destroy() public onlyBy(creator) {
		require(numActive == 1);
		selfdestruct(creator);
	}
}